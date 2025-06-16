import { AppNode, AppEdge, ExecutionResult, ExecutionStatistics, ExecutionLog } from './Common';
import { FlowData } from './FlowEngine';

// 执行上下文
export interface ExecutionContext {
  // 执行变量存储
  variables: Record<string, any>;
  // 当前执行的节点
  currentNode: AppNode;
  // 上一个执行的节点
  previousNode?: AppNode;
  // 执行ID
  executionId: string;
  // 开始时间
  startTime: number;
  // 执行配置
  config: ExecutionConfig;
  // 用户数据
  userData?: Record<string, any>;
}

// 执行配置
export interface ExecutionConfig {
  // 最大执行时间（毫秒）
  maxExecutionTime?: number;
  // 最大执行节点数
  maxExecutionNodes?: number;
  // 是否并行执行
  parallel?: boolean;
  // 错误处理策略
  errorHandling?: 'stop' | 'continue' | 'retry';
  // 重试次数
  retryCount?: number;
  // 调试模式
  debug?: boolean;
  // 执行前钩子
  beforeExecute?: (node: AppNode, context: ExecutionContext) => Promise<void>;
  // 执行后钩子
  afterExecute?: (node: AppNode, result: any, context: ExecutionContext) => Promise<void>;
}

// 节点执行状态
export enum NodeExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

// 节点执行信息
export interface NodeExecutionInfo {
  nodeId: string;
  status: NodeExecutionStatus;
  startTime?: number;
  endTime?: number;
  executionTime?: number;
  input?: any;
  output?: any;
  error?: Error;
}

// 流程执行器接口
export interface FlowExecutor {
  // 执行流程
  execute(startNodeId?: string, config?: ExecutionConfig): Promise<ExecutionResult>;
  // 暂停执行
  pause(): void;
  // 恢复执行
  resume(): void;
  // 停止执行
  stop(): void;
  // 获取执行状态
  getStatus(): ExecutionStatus;
  // 获取执行进度
  getProgress(): ExecutionProgress;
}

// 执行状态
export enum ExecutionStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  STOPPED = 'stopped'
}

// 执行进度
export interface ExecutionProgress {
  // 当前状态
  status: ExecutionStatus;
  // 总节点数
  totalNodes: number;
  // 已执行节点数
  executedNodes: number;
  // 当前执行的节点
  currentNode?: AppNode;
  // 进度百分比
  percentage: number;
  // 预计剩余时间（毫秒）
  estimatedRemainingTime?: number;
}

// 条件执行器
export interface ConditionalExecutor {
  // 评估条件
  evaluate(condition: string, context: ExecutionContext): boolean;
  // 支持的操作符
  getSupportedOperators(): string[];
}

// 循环执行器
export interface LoopExecutor {
  // 执行循环
  executeLoop(
    loopConfig: LoopConfig,
    context: ExecutionContext
  ): Promise<any[]>;
}

// 循环配置
export interface LoopConfig {
  // 循环类型
  type: 'for' | 'while' | 'forEach';
  // 循环条件或数据
  condition?: string;
  data?: any[];
  // 最大迭代次数
  maxIterations?: number;
  // 循环体节点
  bodyNodes: string[];
}

// 并行执行器
export interface ParallelExecutor {
  // 并行执行多个分支
  executeParallel(
    branches: ExecutionBranch[],
    context: ExecutionContext
  ): Promise<any[]>;
}

// 执行分支
export interface ExecutionBranch {
  // 分支ID
  id: string;
  // 分支节点
  nodes: AppNode[];
  // 分支条件
  condition?: string;
  // 分支优先级
  priority?: number;
}