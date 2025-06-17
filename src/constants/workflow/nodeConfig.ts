/**
 * 工作流节点配置常量
 * 统一管理节点的显示配置和创建逻辑
 */

import {
  NodeType,
  NodeCategory,
  NodeTypeConfig,
  StandardWorkflowNode,
  InputNodeData,
  AgentNodeData,
  OutputNodeData
} from '@/types/workflow/nodeTypes';

// 节点分类配置
export const NODE_CATEGORIES = {
  [NodeCategory.BASIC]: '基础节点',
  [NodeCategory.AI]: 'AI节点'
} as const;

// 核心节点配置
export const NODE_CONFIGS: Record<NodeType, NodeTypeConfig> = {
  [NodeType.INPUT]: {
    id: 'input',
    type: NodeType.INPUT,
    title: '输入节点',
    description: '接收用户输入文本',
    icon: '📥',
    category: NodeCategory.BASIC
  },
  [NodeType.AGENT]: {
    id: 'agent',
    type: NodeType.AGENT,
    title: '智能体节点',
    description: '智能体代理处理',
    icon: '🤖',
    category: NodeCategory.AI
  },
  [NodeType.OUTPUT]: {
    id: 'output',
    type: NodeType.OUTPUT,
    title: '输出节点',
    description: '输出最终结果',
    icon: '📤',
    category: NodeCategory.BASIC
  }
};

// 节点创建工厂函数
export const createInputNode = (id: string, position: { x: number; y: number }): StandardWorkflowNode => {
  const config = NODE_CONFIGS[NodeType.INPUT];
  return {
    id,
    type: 'custom',
    position,
    data: {
      label: config.title,
      nodeType: NodeType.INPUT,
      description: config.description,
      outputValue: '',
      placeholder: '请输入内容...'
    } as InputNodeData
  };
};

export const createAgentNode = (id: string, position: { x: number; y: number }): StandardWorkflowNode => {
  const config = NODE_CONFIGS[NodeType.AGENT];
  return {
    id,
    type: 'custom',
    position,
    data: {
      label: config.title,
      nodeType: NodeType.AGENT,
      description: config.description,
      inputValue: '',
      outputValue: '',
      modelConfig: {
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: ''
      }
    } as AgentNodeData
  };
};

export const createOutputNode = (id: string, position: { x: number; y: number }): StandardWorkflowNode => {
  const config = NODE_CONFIGS[NodeType.OUTPUT];
  return {
    id,
    type: 'custom',
    position,
    data: {
      label: config.title,
      nodeType: NodeType.OUTPUT,
      description: config.description,
      inputValue: '',
      displayConfig: {
        format: 'text',
        template: ''
      }
    } as OutputNodeData
  };
};

// 节点创建函数映射
export const NODE_CREATORS = {
  [NodeType.INPUT]: createInputNode,
  [NodeType.AGENT]: createAgentNode,
  [NodeType.OUTPUT]: createOutputNode
} as const;

// 通用节点创建函数
export const createNode = (
  nodeType: NodeType,
  id: string,
  position: { x: number; y: number }
): StandardWorkflowNode => {
  const creator = NODE_CREATORS[nodeType];
  if (!creator) {
    throw new Error(`不支持的节点类型: ${nodeType}`);
  }
  return creator(id, position);
};

// 获取所有可用的节点配置
export const getAllNodeConfigs = (): NodeTypeConfig[] => {
  return Object.values(NODE_CONFIGS);
};

// 根据分类获取节点配置
export const getNodeConfigsByCategory = (category: NodeCategory): NodeTypeConfig[] => {
  return Object.values(NODE_CONFIGS).filter(config => config.category === category);
};

// 获取单个节点配置
export const getNodeConfig = (nodeType: NodeType): NodeTypeConfig => {
  const config = NODE_CONFIGS[nodeType];
  if (!config) {
    throw new Error(`未找到节点类型配置: ${nodeType}`);
  }
  return config;
};

// 默认工作流模板
export const createDefaultWorkflowTemplate = () => {
  const nodes = [
    createInputNode('input-node', { x: 100, y: 100 }),
    createAgentNode('agent-node', { x: 300, y: 100 }),
    createOutputNode('output-node', { x: 500, y: 100 })
  ];

  const edges = [
    {
      id: 'input-to-agent',
      source: 'input-node',
      target: 'agent-node'
    },
    {
      id: 'agent-to-output',
      source: 'agent-node',
      target: 'output-node'
    }
  ];

  return { nodes, edges };
};