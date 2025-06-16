// 验证结果
export interface ValidationResult {
  valid: boolean;
  message?: string;
  errors?: Array<{
    type: 'node' | 'edge' | 'flow';
    id?: string;
    message: string;
  }>;
}

// 执行统计
export interface ExecutionStatistics {
  // 总节点数
  totalNodes: number;
  // 成功执行的节点数
  successNodes: number;
  // 失败的节点数
  failedNodes: number;
  // 跳过的节点数
  skippedNodes: number;
  // 平均执行时间
  averageExecutionTime: number;
  // 内存使用情况
  memoryUsage?: {
    used: number;
    total: number;
  };
}

// 执行日志
export interface ExecutionLog {
  // 时间戳
  timestamp: number;
  // 日志级别
  level: 'debug' | 'info' | 'warn' | 'error';
  // 节点ID
  nodeId?: string;
  // 消息
  message: string;
  // 额外数据
  data?: any;
}

// 执行结果
export interface ExecutionResult {
  // 是否成功
  success: boolean;
  // 执行结果数据
  result?: any;
  // 错误信息
  error?: Error;
  // 执行时间（毫秒）
  executionTime: number;
  // 已执行的节点ID列表
  executedNodes: string[];
  // 执行统计
  statistics?: ExecutionStatistics;
  // 执行日志
  logs?: ExecutionLog[];
}

// 应用节点类型
export interface AppNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
  selected?: boolean;
  dragging?: boolean;
}

// 应用边类型
export interface AppEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  data?: any;
}

// 连接信息
export interface Connection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// 插件配置
export interface PluginConfig {
  url: string;
  enabled: boolean;
  config?: Record<string, any>;
}