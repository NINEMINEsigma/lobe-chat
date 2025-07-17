import { FlowData, AppNode, AppEdge, ValidationResult, ExecutionResult } from '@/components/FlowmixFlow/core/types';
import { LobeAgentWorkflow, LobeAgentWorkflowNode } from './workflow';
import { Edge } from '@xyflow/react';
import { NodeType } from '../workflow/nodeTypes';

// 扩展的FlowmixFlow数据结构，兼容LobeChat
export interface LobeFlowData extends FlowData {
  // 向后兼容字段
  legacyNodes?: LobeAgentWorkflowNode[];
  agentId?: string;

  // FlowmixFlow增强字段
  validation?: ValidationResult;
  execution?: ExecutionResult;

  // LobeChat特有字段
  meta?: {
    name?: string;
    description?: string;
    version?: string;
    createdAt?: string;
    updatedAt?: string;
    agentId?: string;
    isLegacyImport?: boolean; // 标识是否从旧格式迁移
  };
}

// LobeChat专用的节点类型 - 使用统一类型定义
export interface LobeFlowNode extends AppNode {
  type: 'custom'; // 统一使用 custom 类型
  data: {
    nodeType: NodeType; // 使用统一的节点类型枚举
    label: string;
    description?: string;
    labelKey?: string; // 向后兼容
    descriptionKey?: string; // 向后兼容
    config?: any;
    // FlowmixFlow特有的数据
    validation?: ValidationResult;
    lastExecuted?: number;
    executionCount?: number;
  };
}

// LobeChat专用的边类型
export interface LobeFlowEdge extends AppEdge {
  data?: {
    label?: string;
    animated?: boolean;
    style?: React.CSSProperties;
  };
}

// 工作流适配器接口
export interface WorkflowAdapter {
  /**
   * 从旧格式转换到新格式
   */
  fromLegacy(workflow: LobeAgentWorkflow): LobeFlowData;

  /**
   * 从新格式转换到旧格式（用于回滚）
   */
  toLegacy(flowData: LobeFlowData): LobeAgentWorkflow;

  /**
   * 验证数据完整性
   */
  validate(data: LobeFlowData): ValidationResult;

  /**
   * 检查是否为旧格式数据
   */
  isLegacyFormat(data: any): data is LobeAgentWorkflow;

  /**
   * 检查是否为新格式数据
   */
  isFlowmixFormat(data: any): data is LobeFlowData;
}

// 迁移配置
export interface MigrationConfig {
  // 是否保留原数据作为备份
  keepBackup: boolean;

  // 迁移失败时是否自动回滚
  autoRollback: boolean;

  // 验证级别：'strict' | 'loose' | 'none'
  validationLevel: 'strict' | 'loose' | 'none';

  // 是否在迁移后立即验证
  validateAfterMigration: boolean;
}

// 迁移结果
export interface MigrationResult {
  success: boolean;
  originalData?: LobeAgentWorkflow;
  migratedData?: LobeFlowData;
  errors?: string[];
  warnings?: string[];
  backupKey?: string;
}

// 节点类型映射 - 使用统一的节点类型
export const NODE_TYPE_MAPPING: Record<NodeType, string> = {
  [NodeType.AGENT]: 'lobe-agent',
  [NodeType.INPUT]: 'lobe-input',
  [NodeType.OUTPUT]: 'lobe-output'
};

// 默认配置
export const DEFAULT_MIGRATION_CONFIG: MigrationConfig = {
  keepBackup: true,
  autoRollback: true,
  validationLevel: 'loose',
  validateAfterMigration: true
};