/**
 * 统一的工作流节点类型定义
 * 集中管理所有节点类型，确保一致性
 */

// 核心节点类型枚举
export enum NodeType {
  INPUT = 'input',
  AGENT = 'agent',
  OUTPUT = 'output'
}

// 节点分类枚举
export enum NodeCategory {
  BASIC = 'basic',
  AI = 'ai'
}

// 基础节点数据接口
export interface BaseNodeData {
  label: string;
  nodeType: NodeType;
  description?: string;
  config?: any;
}

// 输入节点数据
export interface InputNodeData extends BaseNodeData {
  nodeType: NodeType.INPUT;
  outputValue?: string;
  placeholder?: string;
}

// 智能体节点数据
export interface AgentNodeData extends BaseNodeData {
  nodeType: NodeType.AGENT;
  inputValue?: string;
  outputValue?: string;
  modelConfig?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  };
}

// 输出节点数据
export interface OutputNodeData extends BaseNodeData {
  nodeType: NodeType.OUTPUT;
  inputValue?: string;
  displayConfig?: {
    format?: 'text' | 'markdown' | 'json';
    template?: string;
  };
}

// 节点数据联合类型
export type WorkflowNodeData = InputNodeData | AgentNodeData | OutputNodeData;

// 标准化的节点结构
export interface StandardWorkflowNode {
  id: string;
  type: 'custom'; // React Flow 类型，统一为 custom
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

// 节点配置接口
export interface NodeTypeConfig {
  id: string;
  type: NodeType;
  title: string;
  description: string;
  icon: string;
  category: NodeCategory;
}

// 节点创建模板接口
export interface NodeTemplate {
  createNode: (id: string, position: { x: number; y: number }) => StandardWorkflowNode;
}

// 类型守卫函数
export const isInputNode = (data: WorkflowNodeData): data is InputNodeData => {
  return data.nodeType === NodeType.INPUT;
};

export const isAgentNode = (data: WorkflowNodeData): data is AgentNodeData => {
  return data.nodeType === NodeType.AGENT;
};

export const isOutputNode = (data: WorkflowNodeData): data is OutputNodeData => {
  return data.nodeType === NodeType.OUTPUT;
};

// 获取节点类型的工具函数
export const getNodeType = (node: any): NodeType => {
  return node?.data?.nodeType || NodeType.INPUT; // 默认回退到INPUT
};

// 验证节点类型的函数
export const isValidNodeType = (type: string): type is NodeType => {
  return Object.values(NodeType).includes(type as NodeType);
};