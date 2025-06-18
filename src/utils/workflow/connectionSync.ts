/**
 * 工作流连接同步工具函数
 * 确保React Flow的edges数组与节点data中的连接信息保持同步
 */

import { Edge } from '@xyflow/react';

export interface ConnectionInfo {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string;
  targetHandle?: string;
}

/**
 * 根据边ID获取节点的输入连接
 */
export const getNodeInputConnections = (nodeId: string, edges: Edge[]): ConnectionInfo[] => {
  return edges
    .filter(edge => edge.target === nodeId)
    .map(edge => ({
      edgeId: edge.id,
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
      sourceHandle: edge.sourceHandle || undefined,
      targetHandle: edge.targetHandle || undefined
    }));
};

/**
 * 根据边ID获取节点的输出连接
 */
export const getNodeOutputConnections = (nodeId: string, edges: Edge[]): ConnectionInfo[] => {
  return edges
    .filter(edge => edge.source === nodeId)
    .map(edge => ({
      edgeId: edge.id,
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
      sourceHandle: edge.sourceHandle || undefined,
      targetHandle: edge.targetHandle || undefined
    }));
};

/**
 * 更新单个节点的连接信息
 */
export const updateNodeConnections = (node: any, edges: Edge[]): any => {
  const inputConnections = getNodeInputConnections(node.id, edges);
  const outputConnections = getNodeOutputConnections(node.id, edges);

  return {
    ...node,
    data: {
      ...node.data,
      inputConnections: inputConnections.map(conn => conn.edgeId),
      outputConnections: outputConnections.map(conn => conn.edgeId),
      // 保存详细连接信息供高级功能使用
      inputConnectionDetails: inputConnections,
      outputConnectionDetails: outputConnections
    }
  };
};

/**
 * 批量更新所有节点的连接信息
 */
export const updateAllNodesConnections = (nodes: any[], edges: Edge[]): any[] => {
  return nodes.map(node => updateNodeConnections(node, edges));
};

/**
 * 获取节点的连接统计信息
 */
export const getNodeConnectionStats = (node: any, edges: Edge[]) => {
  const inputConnections = getNodeInputConnections(node.id, edges);
  const outputConnections = getNodeOutputConnections(node.id, edges);

  return {
    inputCount: inputConnections.length,
    outputCount: outputConnections.length,
    totalConnections: inputConnections.length + outputConnections.length,
    hasInputConnection: inputConnections.length > 0,
    hasOutputConnection: outputConnections.length > 0,
    isConnected: inputConnections.length > 0 || outputConnections.length > 0
  };
};

/**
 * 检查节点是否可以执行
 * 输入节点无需输入连接，其他节点需要至少一个输入连接
 */
export const canNodeExecute = (node: any, edges: Edge[]): boolean => {
  const nodeType = node.data?.nodeType;

  // 输入节点不需要输入连接
  if (nodeType === 'input') {
    return true;
  }

  // 其他节点需要至少一个输入连接
  const inputConnections = getNodeInputConnections(node.id, edges);
  return inputConnections.length > 0;
};

/**
 * 数据兼容性处理 - 确保节点包含连接信息字段
 */
export const ensureNodeConnectionFields = (node: any): any => {
  return {
    ...node,
    data: {
      ...node.data,
      // 如果缺少连接信息字段，则初始化为空数组
      inputConnections: node.data?.inputConnections || [],
      outputConnections: node.data?.outputConnections || [],
      inputConnectionDetails: node.data?.inputConnectionDetails || [],
      outputConnectionDetails: node.data?.outputConnectionDetails || []
    }
  };
};

/**
 * 批量处理节点兼容性 - 确保所有节点都有连接信息字段
 */
export const ensureAllNodesConnectionFields = (nodes: any[]): any[] => {
  return nodes.map(ensureNodeConnectionFields);
};

/**
 * 完整的数据初始化处理 - 兼容性处理 + 连接同步
 */
export const initializeWorkflowData = (nodes: any[], edges: Edge[]): { nodes: any[], edges: Edge[] } => {
  // 1. 首先确保所有节点都有连接信息字段
  const compatibleNodes = ensureAllNodesConnectionFields(nodes);

  // 2. 然后根据边数据同步连接信息
  const synchronizedNodes = updateAllNodesConnections(compatibleNodes, edges);

  return {
    nodes: synchronizedNodes,
    edges
  };
};

/**
 * 检测数据是否需要迁移
 */
export const needsDataMigration = (nodes: any[]): boolean => {
  return nodes.some(node =>
    !node.data?.hasOwnProperty('inputConnections') ||
    !node.data?.hasOwnProperty('outputConnections')
  );
};