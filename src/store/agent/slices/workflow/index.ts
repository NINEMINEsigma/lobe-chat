import { Edge, Node } from '@xyflow/react';

export interface WorkflowState {
  currentWorkflow?: {
    nodes: Node[];
    edges: Edge[];
    version: string;
  };
}

export interface WorkflowActions {
  loadWorkflow: (id: string) => void;
  updateWorkflow: (workflow: WorkflowState['currentWorkflow']) => void;
}

export const createWorkflowSlice = () => ({
  currentWorkflow: undefined,
  loadWorkflow: (id: string) => {
    // 实现加载工作流的逻辑
  },
  updateWorkflow: (workflow) => {
    // 实现更新工作流的逻辑
  },
});