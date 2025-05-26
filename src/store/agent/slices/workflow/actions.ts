import { produce } from 'immer';
import { StateCreator } from 'zustand';
import { LobeAgentWorkflow } from '@/types/agent/workflow';
import { AgentStore } from '../../store';

export interface WorkflowActions {
  updateWorkflow: (workflow: LobeAgentWorkflow) => void;
  saveWorkflow: () => Promise<void>;
  loadWorkflow: (agentId: string) => Promise<void>;
}

export const createWorkflowSlice: StateCreator<
  AgentStore,
  [['zustand/devtools', never]],
  [],
  WorkflowActions
> = (set, get) => ({
  updateWorkflow: (workflow) => {
    set(
      produce((state) => {
        const agentId = state.activeId;
        if (!state.agentMap[agentId]) {
          state.agentMap[agentId] = {};
        }
        state.agentMap[agentId].workflow = workflow;
        state.isWorkflowModified = true;
      }),
      false,
      'workflow/update',
    );
  },

  saveWorkflow: async () => {
    const { activeId, agentMap } = get();
    const workflow = agentMap[activeId]?.workflow;

    if (!workflow) return;

    await get().updateAgentConfig({ workflow });

    set({ isWorkflowModified: false }, false, 'workflow/save');
  },

  loadWorkflow: async (agentId) => {
    const config = await get().fetchAgentConfig(agentId);

    if (config?.workflow) {
      set(
        produce((state) => {
          state.currentWorkflow = config.workflow;
          state.isWorkflowModified = false;
        }),
        false,
        'workflow/load',
      );
    }
  },
});