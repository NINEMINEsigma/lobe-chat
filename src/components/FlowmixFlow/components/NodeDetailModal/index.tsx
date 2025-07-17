'use client';

import React, { memo, useState, useEffect, useCallback } from 'react';
import { Modal, Tabs, Button, Space, Typography, Divider, App } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';
import { CloseOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';

import { AppNode } from '../../core/types/Common';
import { ExecutionContext, InputNodeData, LLMNodeData, OutputNodeData } from '../../core/types/NodePlugin';

import NodeBasicInfo from './components/NodeBasicInfo';
import NodeInputPanel from './components/NodeInputPanel';
import NodeOutputPanel from './components/NodeOutputPanel';
import NodeConfigPanel from './components/NodeConfigPanel';
import VisualBindingPanel from '../../shared/ParameterBinding/VisualBindingPanel';
import { ParameterMapping, validateParameterMappings } from '@/utils/workflow/multiInputCollector';

const { Title } = Typography;

// 节点详情弹窗属性接口
export interface NodeDetailModalProps {
  open: boolean;
  node: AppNode | null;
  onClose: () => void;
  onSave: (nodeId: string, data: any) => void;
  executionContext?: ExecutionContext;
  // 新增：工作流上下文数据
  allNodes?: AppNode[];
  allEdges?: any[];
}

// 节点详情弹窗状态接口
interface NodeDetailModalState {
  activeTab: 'basic' | 'input' | 'output' | 'config' | 'parameterBinding';
  nodeData: any;
  isModified: boolean;
  validationErrors: string[];
}

const useStyles = createStyles(({ token, css }) => ({
  modal: css`
    .ant-modal-content {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px) saturate(1.1);
      -webkit-backdrop-filter: blur(20px) saturate(1.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .ant-modal-header {
      background: transparent;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .ant-modal-body {
      padding: 0;
    }

    .ant-modal-footer {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255, 255, 255, 0.15);
    }
  `,

  headerContent: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  `,

  nodeTypeTag: css`
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: rgba(59, 130, 246, 0.9);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,

  tabContent: css`
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 12px;
    padding: 20px;
    margin: 16px;
    min-height: 400px;
  `,

  parameterPanel: css`
    background: rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  `,

  modifiedIndicator: css`
    color: ${token.colorWarning};
    font-size: 12px;
    margin-left: 8px;
  `,

  errorMessage: css`
    color: ${token.colorError};
    font-size: 12px;
    margin-top: 4px;
  `
}));

const NodeDetailModal: React.FC<NodeDetailModalProps> = memo(({
  open,
  node,
  onClose,
  onSave,
  executionContext,
  allNodes = [],
  allEdges = []
}) => {
  const { styles } = useStyles();
  const { t } = useTranslation('workflow');
  const { modal } = App.useApp();

  // 状态管理
  const [state, setState] = useState<NodeDetailModalState>({
    activeTab: 'basic',
    nodeData: {},
    isModified: false,
    validationErrors: []
  });

  // 初始化节点数据
  useEffect(() => {
    if (node && open) {
            // 深拷贝节点数据，确保parameterMappings正确初始化
      const rawParameterMappings = node.data?.parameterMappings || [];
      const validParameterMappings = validateParameterMappings(rawParameterMappings);

      const initialNodeData = {
        ...node.data,
        // 确保parameterMappings字段存在并且数据有效
        parameterMappings: validParameterMappings
      };

      console.log('[NodeDetailModal] 初始化节点数据:', {
        nodeId: node.id,
        nodeType: node.data?.nodeType || node.type,
        hasParameterMappings: !!node.data?.parameterMappings,
        parameterMappingsCount: node.data?.parameterMappings?.length || 0,
        initialNodeData: initialNodeData
      });

      setState(prev => ({
        ...prev,
        nodeData: initialNodeData,
        isModified: false,
        validationErrors: []
      }));
    }
  }, [node, open]);

  // 数据更新处理
  const handleDataChange = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      nodeData: {
        ...prev.nodeData,
        [field]: value
      },
      isModified: true
    }));
  }, []);

  // 数据验证
  const validateData = useCallback(() => {
    const errors: string[] = [];

    if (!node) return errors;

    // 基础验证逻辑
    switch (node.type) {
      case 'input':
        // 输入节点验证
        if (!state.nodeData.placeholder || state.nodeData.placeholder.trim() === '') {
          errors.push(t('nodeDetail.validation.placeholderRequired'));
        }
        break;

      case 'llm':
        // 大模型节点验证
        if (state.nodeData.modelConfig?.temperature !== undefined) {
          const temp = state.nodeData.modelConfig.temperature;
          if (temp < 0 || temp > 2) {
            errors.push(t('nodeDetail.validation.temperatureRange'));
          }
        }
        if (state.nodeData.modelConfig?.maxTokens !== undefined) {
          const tokens = state.nodeData.modelConfig.maxTokens;
          if (tokens < 1 || tokens > 4096) {
            errors.push(t('nodeDetail.validation.maxTokensRange'));
          }
        }
        break;

      case 'output':
        // 输出节点验证
        // 暂时无特殊验证要求
        break;
    }

    setState(prev => ({ ...prev, validationErrors: errors }));
    return errors;
  }, [node, state.nodeData, t]);

  // 保存处理
  const handleSave = useCallback(() => {
    if (!node) return;

    const errors = validateData();
    if (errors.length > 0) {
      return; // 验证失败，不保存
    }

    // 确保parameterMappings数据完整性
    const validParameterMappings = validateParameterMappings(state.nodeData.parameterMappings || []);
    const dataToSave = {
      ...state.nodeData,
      parameterMappings: validParameterMappings
    };

    console.log('[NodeDetailModal] 保存节点数据:', {
      nodeId: node.id,
      nodeType: node.data?.nodeType || node.type,
      parameterMappingsCount: dataToSave.parameterMappings.length,
      parameterMappings: dataToSave.parameterMappings,
      fullData: dataToSave
    });

    onSave(node.id, dataToSave);
    setState(prev => ({ ...prev, isModified: false }));

    // 验证保存后的状态
    console.log('[NodeDetailModal] 保存完成，状态重置为未修改');
  }, [node, state.nodeData, onSave, validateData]);

  // 重置处理
  const handleReset = useCallback(() => {
    if (node) {
      setState(prev => ({
        ...prev,
        nodeData: { ...node.data },
        isModified: false,
        validationErrors: []
      }));
    }
  }, [node]);

  // 关闭处理
  const handleClose = useCallback(() => {
    if (state.isModified) {
      modal.confirm({
        title: t('nodeDetail.confirmClose.title'),
        content: t('nodeDetail.confirmClose.content'),
        okText: t('nodeDetail.actions.save'),
        cancelText: t('nodeDetail.actions.discard'),
        onOk: () => {
          handleSave();
          onClose();
        },
        onCancel: () => {
          onClose();
        }
      });
    } else {
      onClose();
    }
  }, [state.isModified, handleSave, onClose, t, modal]);

  // 参数映射变化处理
  const handleParameterMappingsChange = useCallback((mappings: ParameterMapping[]) => {
    console.log('[NodeDetailModal] 参数映射变化:', {
      nodeId: node?.id,
      nodeType: node?.data?.nodeType || node?.type,
      previousCount: state.nodeData.parameterMappings?.length || 0,
      newCount: mappings.length,
      mappings: mappings
    });

    handleDataChange('parameterMappings', mappings);
  }, [handleDataChange, node?.id, node?.data?.nodeType, node?.type, state.nodeData.parameterMappings]);

  // Tab配置
  const tabItems = [
    {
      key: 'basic',
      label: t('nodeDetail.tabs.basic'),
      children: (
        <div className={styles.tabContent}>
          <NodeBasicInfo
            node={node}
            data={state.nodeData}
            onChange={handleDataChange}
            executionContext={executionContext}
          />
        </div>
      )
    },
    {
      key: 'input',
      label: t('nodeDetail.tabs.input'),
      children: (
        <div className={styles.tabContent}>
          <NodeInputPanel
            node={node}
            data={state.nodeData}
            onChange={handleDataChange}
            executionContext={executionContext}
          />
        </div>
      )
    },
    {
      key: 'output',
      label: t('nodeDetail.tabs.output'),
      children: (
        <div className={styles.tabContent}>
          <NodeOutputPanel
            node={node}
            data={state.nodeData}
            onChange={handleDataChange}
            executionContext={executionContext}
          />
        </div>
      )
    },
    {
      key: 'config',
      label: t('nodeDetail.tabs.config'),
      children: (
        <div className={styles.tabContent}>
          <NodeConfigPanel
            node={node}
            data={state.nodeData}
            onChange={handleDataChange}
            executionContext={executionContext}
          />
        </div>
      )
    },
    {
      key: 'parameterBinding',
      label: '参数绑定',
      children: (
        <div className={styles.tabContent}>
          {node && (
            <VisualBindingPanel
              currentNode={node}
              allNodes={allNodes}
              allEdges={allEdges}
              parameterMappings={state.nodeData.parameterMappings || []}
              onParameterMappingsChange={handleParameterMappingsChange}
              readonly={false}
              title="节点参数绑定"
            />
          )}
        </div>
      )
    }
  ];

  // 获取节点类型
  const getNodeType = (node: AppNode | null): string => {
    if (!node) return 'unknown';
    return node.data?.nodeType || node.type || 'unknown';
  };

  // 获取节点类型标签的样式
  const getNodeTypeTagStyle = (nodeType: string) => {
    const typeStyles = {
      input: { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: 'rgba(59, 130, 246, 0.9)' },
      llm: { backgroundColor: 'rgba(147, 51, 234, 0.15)', borderColor: 'rgba(147, 51, 234, 0.3)', color: 'rgba(147, 51, 234, 0.9)' },
      output: { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.3)', color: 'rgba(34, 197, 94, 0.9)' }
    };

    return typeStyles[nodeType as keyof typeof typeStyles] || typeStyles.input;
  };

  if (!node) return null;

  const currentNodeType = getNodeType(node);

  return (
    <Modal
      title={
        <div className={styles.headerContent}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {t('nodeDetail.title')}
              {state.isModified && (
                <span className={styles.modifiedIndicator}>
                  {t('nodeDetail.modified')}
                </span>
              )}
            </Title>
          </div>
          <div
            className={styles.nodeTypeTag}
            style={getNodeTypeTagStyle(currentNodeType)}
          >
            {currentNodeType.toUpperCase()}
          </div>
        </div>
      }
      open={open}
      onCancel={handleClose}
      width={800}
      className={styles.modal}
      footer={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            disabled={!state.isModified}
          >
            {t('nodeDetail.actions.reset')}
          </Button>
          <Button
            icon={<CloseOutlined />}
            onClick={handleClose}
          >
            {t('nodeDetail.actions.cancel')}
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            disabled={state.validationErrors.length > 0}
          >
            {t('nodeDetail.actions.save')}
          </Button>
        </Space>
      }
      maskClosable={false}
      destroyOnClose
    >
      {state.validationErrors.length > 0 && (
        <div className={styles.parameterPanel}>
          <Typography.Text type="danger" strong>
            {t('nodeDetail.validationErrors')}:
          </Typography.Text>
          {state.validationErrors.map((error, index) => (
            <div key={index} className={styles.errorMessage}>
              • {error}
            </div>
          ))}
        </div>
      )}

      <Tabs
        activeKey={state.activeTab}
        onChange={(key) => setState(prev => ({ ...prev, activeTab: key as any }))}
        items={tabItems}
        type="card"
        size="large"
      />
    </Modal>
  );
});

NodeDetailModal.displayName = 'NodeDetailModal';

export default NodeDetailModal;