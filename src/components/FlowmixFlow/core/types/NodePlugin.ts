import React from 'react';
import { ValidationResult, AppNode, AppEdge, Connection, PluginConfig } from './Common';

// 节点插件配置
export interface NodePluginConfig {
  id: string;
  name: string;
  category: string;
  icon?: string;
  description?: string;
  version: string;
  author?: string;
}

// 节点属性Schema定义
export interface NodePluginSchema {
  properties: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      label: string;
      description?: string;
      default?: any;
      required?: boolean;
      options?: Array<{ label: string; value: any }>; // 用于下拉选择等
      validation?: (value: any) => boolean | string;
    }
  };
}

// 节点组件Props
export interface NodeProps {
  id: string;
  data: any;
  selected: boolean;
  isConnectable: boolean;
  xPos: number;
  yPos: number;
  updateNode?: (nodeId: string, data: any) => void;
}

// 属性编辑组件Props
export interface PropertiesProps {
  node: AppNode;
  onChange: (data: any) => void;
}

// 弹窗组件Props
export interface DialogProps {
  node: AppNode;
  onSave: (data: any) => void;
  onCancel: () => void;
}

// 节点上下文
export interface NodeContext {
  registry: any; // NodeRegistry类型，避免循环依赖
  updateNode: (nodeId: string, data: any) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: any) => void;
}

// 节点插件组件定义
export interface NodePluginComponent {
  // 节点渲染组件
  NodeComponent: React.ComponentType<NodeProps>;
  // 属性编辑组件（可选）
  PropertiesComponent?: React.ComponentType<PropertiesProps>;
  // 自定义弹窗组件（可选）
  DialogComponent?: React.ComponentType<DialogProps>;
}

// 节点插件行为定义
export interface NodePluginBehaviors {
  onDoubleClick?: (node: AppNode, context: NodeContext) => void;
  onConnect?: (connection: Connection, context: NodeContext) => boolean;
  onDataChange?: (data: any, context: NodeContext) => void;
  validate?: (node: AppNode) => ValidationResult;
}

// 节点插件完整定义
export interface NodePlugin {
  config: NodePluginConfig;
  schema: NodePluginSchema;
  component: NodePluginComponent;
  // 节点行为定义（可选）
  behaviors?: NodePluginBehaviors;
  // 运行时执行逻辑（可选）
  executor?: (input: any, config: any) => Promise<any>;
}