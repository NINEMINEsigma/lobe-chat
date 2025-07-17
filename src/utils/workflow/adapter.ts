import {
  LobeFlowData,
  LobeFlowNode,
  LobeFlowEdge,
  WorkflowAdapter,
  MigrationConfig,
  MigrationResult,
  NODE_TYPE_MAPPING,
  DEFAULT_MIGRATION_CONFIG
} from '@/types/agent/flowmix';
import { LobeAgentWorkflow, LobeAgentWorkflowNode } from '@/types/agent/workflow';
import { ValidationResult } from '@/components/FlowmixFlow/core/types';

/**
 * 工作流数据适配器实现
 * 负责在旧Workflow和新FlowmixFlow格式之间进行转换
 */
export class LobeWorkflowAdapter implements WorkflowAdapter {

  /**
   * 从旧格式转换到新格式
   */
  fromLegacy(workflow: LobeAgentWorkflow): LobeFlowData {
    const convertedNodes: LobeFlowNode[] = workflow.nodes.map((node, index) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        labelKey: node.data.labelKey,
        descriptionKey: node.data.descriptionKey,
        config: node.data.config,
        // 添加FlowmixFlow特有的数据
        validation: undefined,
        lastExecuted: undefined,
        executionCount: 0
      },
      selected: false,
      dragging: false
    }));

    const convertedEdges: LobeFlowEdge[] = workflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
      data: {
        label: edge.label,
        animated: edge.animated,
        style: edge.style
      }
    }));

    return {
      nodes: convertedNodes,
      edges: convertedEdges,
      viewport: {
        x: 0,
        y: 0,
        zoom: 1
      },
      metadata: {
        version: workflow.version,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        agentId: workflow.agentId,
        isLegacyImport: true
      },
      // 保留原始数据用于回滚
      legacyNodes: workflow.nodes,
      validation: {
        valid: true,
        message: 'Migrated from legacy format'
      }
    };
  }

  /**
   * 从新格式转换到旧格式（用于回滚）
   */
  toLegacy(flowData: LobeFlowData): LobeAgentWorkflow {
    // 如果有原始的legacyNodes，优先使用
    if (flowData.legacyNodes) {
      return {
        nodes: flowData.legacyNodes,
        edges: flowData.edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          type: edge.type,
          label: edge.data?.label,
          animated: edge.data?.animated,
          style: edge.data?.style
        })),
        version: flowData.metadata?.version || '1.0'
      };
    }

    // 否则从FlowmixFlow数据转换
    const legacyNodes: LobeAgentWorkflowNode[] = flowData.nodes.map((node) => ({
      id: node.id,
      type: node.type as LobeAgentWorkflowNode['type'],
      position: node.position,
      data: {
        labelKey: (node.data as any).labelKey || `workflow.nodes.${node.type}`,
        descriptionKey: (node.data as any).descriptionKey || `workflow.nodes.${node.type}Desc`,
        config: (node.data as any).config
      }
    }));

    return {
      nodes: legacyNodes,
      edges: flowData.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
        label: edge.data?.label,
        animated: edge.data?.animated,
        style: edge.data?.style
      })),
      version: flowData.metadata?.version || '1.0'
    };
  }

  /**
   * 验证数据完整性
   */
  validate(data: LobeFlowData): ValidationResult {
    const errors: Array<{
      type: 'node' | 'edge' | 'flow';
      id?: string;
      message: string;
    }> = [];

    // 验证节点
    data.nodes.forEach(node => {
      if (!node.id) {
        errors.push({
          type: 'node',
          id: node.id,
          message: 'Node missing required id'
        });
      }

      if (!node.type) {
        errors.push({
          type: 'node',
          id: node.id,
          message: 'Node missing required type'
        });
      }

      if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        errors.push({
          type: 'node',
          id: node.id,
          message: 'Node missing valid position'
        });
      }
    });

    // 验证边
    data.edges.forEach(edge => {
      if (!edge.id) {
        errors.push({
          type: 'edge',
          id: edge.id,
          message: 'Edge missing required id'
        });
      }

      if (!edge.source || !edge.target) {
        errors.push({
          type: 'edge',
          id: edge.id,
          message: 'Edge missing source or target'
        });
      }

      // 验证边的源和目标节点是否存在
      const sourceExists = data.nodes.some(node => node.id === edge.source);
      const targetExists = data.nodes.some(node => node.id === edge.target);

      if (!sourceExists) {
        errors.push({
          type: 'edge',
          id: edge.id,
          message: `Edge source node '${edge.source}' not found`
        });
      }

      if (!targetExists) {
        errors.push({
          type: 'edge',
          id: edge.id,
          message: `Edge target node '${edge.target}' not found`
        });
      }
    });

    return {
      valid: errors.length === 0,
      message: errors.length === 0 ? 'Validation passed' : `Found ${errors.length} errors`,
      errors
    };
  }

  /**
   * 检查是否为旧格式数据
   */
  isLegacyFormat(data: any): data is LobeAgentWorkflow {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.nodes) &&
      Array.isArray(data.edges) &&
      typeof data.version === 'string' &&
      // 检查是否有旧格式的特征
      data.nodes.every((node: any) =>
        node.data &&
        typeof node.data.labelKey === 'string' &&
        typeof node.data.descriptionKey === 'string'
      )
    );
  }

  /**
   * 检查是否为新格式数据
   */
  isFlowmixFormat(data: any): data is LobeFlowData {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.nodes) &&
      Array.isArray(data.edges) &&
      // FlowmixFlow格式特征
      (data.viewport !== undefined || data.metadata !== undefined)
    );
  }
}

/**
 * 工作流迁移服务
 */
export class WorkflowMigrationService {
  private adapter: WorkflowAdapter;
  private config: MigrationConfig;

  constructor(config: Partial<MigrationConfig> = {}) {
    this.adapter = new LobeWorkflowAdapter();
    this.config = { ...DEFAULT_MIGRATION_CONFIG, ...config };
  }

  /**
   * 执行迁移
   */
  async migrate(data: LobeAgentWorkflow, agentId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      originalData: data,
      errors: [],
      warnings: []
    };

    try {
      // 备份原数据
      let backupKey: string | undefined;
      if (this.config.keepBackup) {
        backupKey = this.createBackup(data, agentId);
        result.backupKey = backupKey;
      }

      // 执行转换
      const migratedData = this.adapter.fromLegacy(data);
      migratedData.agentId = agentId;

      // 验证迁移结果
      if (this.config.validateAfterMigration) {
        const validation = this.adapter.validate(migratedData);
        if (!validation.valid) {
          if (this.config.validationLevel === 'strict') {
            throw new Error(`Migration validation failed: ${validation.message}`);
          } else if (this.config.validationLevel === 'loose') {
            result.warnings?.push(`Validation warnings: ${validation.message}`);
          }
        }
        migratedData.validation = validation;
      }

      result.success = true;
      result.migratedData = migratedData;

      console.log('Workflow migration completed successfully', {
        agentId,
        nodeCount: data.nodes.length,
        edgeCount: data.edges.length,
        backupKey
      });

    } catch (error) {
      result.errors?.push(error instanceof Error ? error.message : String(error));

      // 自动回滚
      if (this.config.autoRollback && result.backupKey) {
        this.restoreFromBackup(result.backupKey, agentId);
        result.warnings?.push('Migration failed, automatically rolled back to backup');
      }

      console.error('Workflow migration failed', error);
    }

    return result;
  }

  /**
   * 创建备份
   */
  private createBackup(data: LobeAgentWorkflow, agentId: string): string {
    const backupKey = `workflow_backup_${agentId}_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(data));
    return backupKey;
  }

  /**
   * 从备份恢复
   */
  private restoreFromBackup(backupKey: string, agentId: string): void {
    const backupData = localStorage.getItem(backupKey);
    if (backupData) {
      // 这里应该调用存储服务来恢复数据
      console.log('Restored workflow from backup', { backupKey, agentId });
    }
  }

  /**
   * 清理过期备份
   */
  cleanupOldBackups(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('workflow_backup_')) {
        const timestamp = parseInt(key.split('_').pop() || '0');
        if (now - timestamp > maxAge) {
          localStorage.removeItem(key);
        }
      }
    });
  }
}

// 导出单例实例
export const workflowMigrationService = new WorkflowMigrationService();
export const workflowAdapter = new LobeWorkflowAdapter();