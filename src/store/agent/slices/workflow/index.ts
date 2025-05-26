import { produce } from 'immer';
import { StateCreator } from 'zustand';
import { AgentStore } from '../../store';
import { LobeAgentWorkflow } from '@/types/agent/workflow';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';
import { getStoredWorkflow, saveWorkflowToStorage } from './storage';

export interface WorkflowState {
  currentWorkflow?: LobeAgentWorkflow;
  isWorkflowModified: boolean;
  workflowMeta?: {
    name?: string;
    description?: string;
    tags?: string[];
    status?: 'active' | 'inactive';
  };
}

export interface WorkflowActions {
  loadWorkflow: (id: string) => Promise<void>;
  updateWorkflow: (workflow: LobeAgentWorkflow) => void;
  saveWorkflow: () => Promise<void>;
  updateWorkflowMeta: (meta: Partial<WorkflowState['workflowMeta']>) => void;
  resetWorkflow: () => void;
}

export const createWorkflowSlice: StateCreator<
  AgentStore,
  [['zustand/devtools', never]],
  [],
  WorkflowActions & WorkflowState
> = (set, get) => {
  const slice = {
    currentWorkflow: undefined,
    isWorkflowModified: false,
    workflowMeta: undefined,

    loadWorkflow: async (id: string) => {
      const isLogin = authSelectors.isLogin(useUserStore.getState());

      try {
        // 强制刷新配置以获取最新数据
        await get().internal_refreshAgentConfig?.(id);

        // 获取最新的服务器数据
        const response = await get().useFetchAgentConfig(isLogin, id);
        const serverWorkflow = response?.data?.workflow;

        // 获取本地存储数据
        const storedWorkflow = getStoredWorkflow(id);

        // 如果服务器有数据
        if (serverWorkflow?.definition) {
          const serverTimestamp = new Date(serverWorkflow.meta?.updatedAt || 0).getTime();
          const localTimestamp = new Date(storedWorkflow?.meta?.updatedAt || 0).getTime();

          // 使用较新的数据
          if (!storedWorkflow || serverTimestamp >= localTimestamp) {
            set(
              produce((state) => {
                state.currentWorkflow = serverWorkflow.definition;
                state.workflowMeta = {
                  ...serverWorkflow.meta,
                  status: serverWorkflow.status || 'active',
                };
                state.isWorkflowModified = false;
              }),
              false,
              'workflow/load/server',
            );

            // 同步到本地存储
            saveWorkflowToStorage(id, serverWorkflow);
            return;
          }
        }

        // 如果本地有数据且比服务器新，使用本地数据
        if (storedWorkflow) {
          set(
            produce((state) => {
              state.currentWorkflow = storedWorkflow.definition;
              state.workflowMeta = {
                ...storedWorkflow.meta,
                status: storedWorkflow.status || 'active',
              };
              state.isWorkflowModified = false;
            }),
            false,
            'workflow/load/storage',
          );
          return;
        }

        // 如果都没有数据，创建新的工作流
        const newWorkflow = {
          definition: {
            nodes: [],
            edges: [],
            version: '1.0',
          },
          status: 'active' as const,
          meta: {
            name: '新工作流',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };

        set(
          produce((state) => {
            state.currentWorkflow = newWorkflow.definition;
            state.workflowMeta = {
              ...newWorkflow.meta,
              status: newWorkflow.status,
            };
            state.isWorkflowModified = true;
          }),
          false,
          'workflow/create',
        );

        saveWorkflowToStorage(id, newWorkflow);
      } catch (error) {
        console.error('Failed to load workflow:', error);

        // 如果加载失败，尝试从本地存储恢复
        const storedWorkflow = getStoredWorkflow(id);
        if (storedWorkflow) {
          set(
            produce((state) => {
              state.currentWorkflow = storedWorkflow.definition;
              state.workflowMeta = {
                ...storedWorkflow.meta,
                status: storedWorkflow.status || 'active',
              };
              state.isWorkflowModified = false;
            }),
            false,
            'workflow/load/storage/fallback',
          );
        }
      }
    },

    updateWorkflow: (workflow: LobeAgentWorkflow) => {
      const { activeId } = get();
      if (!activeId) return;

      set(
        produce((state) => {
          state.currentWorkflow = workflow;
          state.isWorkflowModified = true;
        }),
        false,
        'workflow/update',
      );

      // 保存到本地存储
      saveWorkflowToStorage(activeId, {
        definition: workflow,
        status: get().workflowMeta?.status || 'active',
        meta: get().workflowMeta,
      });
    },

    updateWorkflowMeta: (meta: Partial<WorkflowState['workflowMeta']>) => {
      const { activeId, currentWorkflow } = get();
      if (!activeId || !currentWorkflow) return;

      set(
        produce((state) => {
          state.workflowMeta = {
            ...state.workflowMeta,
            ...meta,
          };
          state.isWorkflowModified = true;
        }),
        false,
        'workflow/updateMeta',
      );

      // 保存到本地存储
      saveWorkflowToStorage(activeId, {
        definition: currentWorkflow,
        status: get().workflowMeta?.status || 'active',
        meta: {
          ...get().workflowMeta,
          ...meta,
        },
      });
    },

    saveWorkflow: async () => {
      const { currentWorkflow, workflowMeta, activeId } = get();
      if (!currentWorkflow || !activeId) return;

      const updatedAt = new Date().toISOString();
      const workflowData = {
        definition: currentWorkflow,
        status: workflowMeta?.status || 'active',
        meta: {
          ...workflowMeta,
          updatedAt,
        },
      };

      try {
        // 保存到服务器
        await get().updateAgentConfig({
          workflow: workflowData,
        });

        // 保存到本地存储
        saveWorkflowToStorage(activeId, workflowData);

        // 更新状态
        set(
          produce((state) => {
            state.workflowMeta = {
              ...state.workflowMeta,
              updatedAt,
            };
            state.isWorkflowModified = false;
          }),
          false,
          'workflow/save',
        );

        // 强制刷新配置缓存
        await get().internal_refreshAgentConfig?.(activeId);
      } catch (error) {
        console.error('Failed to save workflow:', error);
      }
    },

    resetWorkflow: () => {
      set(
        {
          currentWorkflow: undefined,
          isWorkflowModified: false,
          workflowMeta: undefined,
        },
        false,
        'workflow/reset',
      );
    },
  };

  return slice;
};