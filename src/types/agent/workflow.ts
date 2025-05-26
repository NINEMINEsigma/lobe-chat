import { Edge } from '@xyflow/react';

export interface LobeAgentWorkflowNode {
  id: string;
  type: 'agent' | 'chat' | 'function' | 'input' | 'llm' | 'settings';
  position: { x: number; y: number };
  data: {
    label: string;
    config?: any;
  };
}

export interface LobeAgentWorkflow {
  nodes: LobeAgentWorkflowNode[];
  edges: Edge[];
  version: string;
}

export interface WorkflowState {
  currentWorkflow?: LobeAgentWorkflow;
  isWorkflowModified: boolean;
}