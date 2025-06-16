import { NodePlugin } from './NodePlugin';
import { ValidationResult, AppNode, AppEdge } from './Common';

// 主题配置
export interface ThemeConfig {
  primaryColor?: string;
  backgroundColor?: string;
  nodeColor?: string;
  edgeColor?: string;
  textColor?: string;
  borderColor?: string;
}

// 流程数据
export interface FlowData {
  nodes: AppNode[];
  edges: AppEdge[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
  metadata?: {
    name?: string;
    description?: string;
    version?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

// 流程验证器接口
export interface FlowValidator {
  validate(flow: FlowData): ValidationResult;
}

// 选择状态
export interface SelectionState {
  nodes: AppNode[];
  edges: AppEdge[];
}

// FlowMix引擎配置
export interface FlowMixConfig {
  // 基础配置
  container: HTMLElement | string;
  width?: number | string;
  height?: number | string;

  // 功能配置
  readonly?: boolean;
  showToolbar?: boolean;
  showMinimap?: boolean;
  showControls?: boolean;
  showBackground?: boolean;

  // 插件配置
  plugins?: string[] | NodePlugin[];
  pluginBaseUrl?: string;

  // 主题配置
  theme?: 'light' | 'dark' | 'auto';
  customTheme?: ThemeConfig;

  // 初始数据
  initialFlow?: FlowData;

  // 事件回调
  onNodeClick?: (node: AppNode) => void;
  onNodeDoubleClick?: (node: AppNode) => void;
  onEdgeClick?: (edge: AppEdge) => void;
  onSelectionChange?: (selection: SelectionState) => void;
  onFlowChange?: (flow: FlowData) => void;
  onSave?: (flow: FlowData) => Promise<void>;
  onLoad?: () => Promise<FlowData>;
  onError?: (error: Error) => void;

  // 验证配置
  validator?: FlowValidator;
  enableValidation?: boolean;

  // 国际化
  locale?: 'zh-CN' | 'en-US';
  messages?: Record<string, string>;

  // 性能配置
  enableVirtualization?: boolean;
  maxNodes?: number;
  maxEdges?: number;
}

// 视口配置
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

// 导出格式
export type ExportFormat = 'json' | 'png' | 'svg' | 'pdf';

// 导入数据类型
export type ImportData = string | File | FlowData;