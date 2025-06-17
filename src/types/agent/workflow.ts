import { Edge } from '@xyflow/react';
import { StandardWorkflowNode, NodeType } from '../workflow/nodeTypes';

// 使用统一的节点类型定义
export interface LobeAgentWorkflowNode extends StandardWorkflowNode {
  // 保持向后兼容的额外字段
  data: StandardWorkflowNode['data'] & {
    labelKey?: string;
    descriptionKey?: string;
    config?: any;
  };
}

export interface LobeAgentWorkflow {
  nodes: LobeAgentWorkflowNode[];
  edges: Edge[];
  version: string;
}

// 向后兼容的类型别名
export type WorkflowNodeType = NodeType;

export interface WorkflowState {
  currentWorkflow?: LobeAgentWorkflow;
  isWorkflowModified: boolean;
}