import { AppNode, AppEdge, ValidationResult, ExecutionResult } from './Common';
import { FlowData, SelectionState, Viewport } from './FlowEngine';

// 事件类型枚举
export enum EventType {
  // 节点事件
  NODE_ADD = 'node:add',
  NODE_UPDATE = 'node:update',
  NODE_REMOVE = 'node:remove',
  NODE_SELECT = 'node:select',
  NODE_CLICK = 'node:click',
  NODE_DOUBLE_CLICK = 'node:doubleClick',
  NODE_DATA_CHANGE = 'node:dataChange',
  NODE_DRAG_START = 'node:dragStart',
  NODE_DRAG = 'node:drag',
  NODE_DRAG_END = 'node:dragEnd',

  // 边事件
  EDGE_ADD = 'edge:add',
  EDGE_UPDATE = 'edge:update',
  EDGE_REMOVE = 'edge:remove',
  EDGE_SELECT = 'edge:select',
  EDGE_CLICK = 'edge:click',

  // 流程事件
  FLOW_LOAD = 'flow:load',
  FLOW_SAVE = 'flow:save',
  FLOW_CHANGE = 'flow:change',
  FLOW_CLEAR = 'flow:clear',
  FLOW_VALIDATE = 'flow:validate',
  FLOW_EXECUTE = 'flow:execute',
  FLOW_EXPORT = 'flow:export',
  FLOW_IMPORT = 'flow:import',

  // 视图事件
  VIEW_FIT = 'view:fit',
  VIEW_ZOOM_IN = 'view:zoomIn',
  VIEW_ZOOM_OUT = 'view:zoomOut',
  VIEW_ZOOM_TO = 'view:zoomTo',
  VIEW_SET_VIEWPORT = 'view:setViewport',
  VIEW_CHANGE = 'view:change',

  // 选择事件
  SELECTION_CHANGE = 'selection:change',
  SELECTION_CLEAR = 'selection:clear',
  SELECTION_SET_NODES = 'selection:setNodes',
  SELECTION_SET_EDGES = 'selection:setEdges',

  // 插件事件
  PLUGIN_REGISTER = 'plugin:register',
  PLUGIN_UNREGISTER = 'plugin:unregister',
  PLUGIN_LOAD = 'plugin:load',
  PLUGIN_ERROR = 'plugin:error',

  // 系统事件
  ENGINE_INIT = 'engine:init',
  ENGINE_DESTROY = 'engine:destroy',
  ENGINE_ERROR = 'engine:error'
}

// 事件数据接口
export interface EventData {
  [EventType.NODE_ADD]: { node: AppNode };
  [EventType.NODE_UPDATE]: { nodeId: string; updates: Partial<AppNode> };
  [EventType.NODE_REMOVE]: { nodeId: string };
  [EventType.NODE_SELECT]: { nodeId: string; selected: boolean };
  [EventType.NODE_CLICK]: { node: AppNode; event: MouseEvent };
  [EventType.NODE_DOUBLE_CLICK]: { node: AppNode; event: MouseEvent };
  [EventType.NODE_DATA_CHANGE]: { nodeId: string; data: any };
  [EventType.NODE_DRAG_START]: { node: AppNode; event: DragEvent };
  [EventType.NODE_DRAG]: { node: AppNode; position: { x: number; y: number } };
  [EventType.NODE_DRAG_END]: { node: AppNode; position: { x: number; y: number } };

  [EventType.EDGE_ADD]: { edge: AppEdge };
  [EventType.EDGE_UPDATE]: { edgeId: string; updates: Partial<AppEdge> };
  [EventType.EDGE_REMOVE]: { edgeId: string };
  [EventType.EDGE_SELECT]: { edgeId: string; selected: boolean };
  [EventType.EDGE_CLICK]: { edge: AppEdge; event: MouseEvent };

  [EventType.FLOW_LOAD]: { flow: FlowData };
  [EventType.FLOW_SAVE]: { flow: FlowData };
  [EventType.FLOW_CHANGE]: { flow: FlowData; changes: FlowChange[] };
  [EventType.FLOW_CLEAR]: {};
  [EventType.FLOW_VALIDATE]: { result: ValidationResult };
  [EventType.FLOW_EXECUTE]: { result: ExecutionResult };
  [EventType.FLOW_EXPORT]: { format: string; data: string | Blob };
  [EventType.FLOW_IMPORT]: { data: any };

  [EventType.VIEW_FIT]: {};
  [EventType.VIEW_ZOOM_IN]: {};
  [EventType.VIEW_ZOOM_OUT]: {};
  [EventType.VIEW_ZOOM_TO]: { zoom: number };
  [EventType.VIEW_SET_VIEWPORT]: { viewport: Viewport };
  [EventType.VIEW_CHANGE]: { viewport: Viewport };

  [EventType.SELECTION_CHANGE]: { selection: SelectionState };
  [EventType.SELECTION_CLEAR]: {};
  [EventType.SELECTION_SET_NODES]: { nodeIds: string[] };
  [EventType.SELECTION_SET_EDGES]: { edgeIds: string[] };

  [EventType.PLUGIN_REGISTER]: { plugin: any };
  [EventType.PLUGIN_UNREGISTER]: { pluginId: string };
  [EventType.PLUGIN_LOAD]: { pluginId: string; url?: string };
  [EventType.PLUGIN_ERROR]: { pluginId: string; error: Error };

  [EventType.ENGINE_INIT]: { config: any };
  [EventType.ENGINE_DESTROY]: {};
  [EventType.ENGINE_ERROR]: { error: Error };
}

// 流程变化类型
export interface FlowChange {
  type: 'node' | 'edge';
  action: 'add' | 'update' | 'remove';
  id: string;
  data?: any;
}

// 事件监听器类型
export type EventListener<T extends EventType> = (data: EventData[T]) => void | Promise<void>;

// 事件监听器映射
export type EventListenerMap = {
  [K in EventType]?: EventListener<K>[];
};

// 事件总线接口
export interface EventBus {
  on<T extends EventType>(event: T, listener: EventListener<T>): void;
  off<T extends EventType>(event: T, listener: EventListener<T>): void;
  emit<T extends EventType>(event: T, data: EventData[T]): void;
  removeAllListeners(): void;
}