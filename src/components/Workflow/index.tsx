'use client';

import React, { memo, useEffect, useState, useCallback } from 'react';
import { Flex, Spin, Alert, Button } from 'antd';
import { createStyles } from 'antd-style';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAgentStore } from '@/store/agent';
import { LobeFlowData } from '@/types/agent/flowmix';

import FlowmixCanvas from './Modules/FlowmixCanvas';
import FlowmixNodes from './Modules/FlowmixNodes';
import FlowmixToolbar from './Modules/FlowmixToolbar';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    height: 100%;
    width: 100%;
    background: ${token.colorBgLayout};
    display: flex;
    flex-direction: column;
  `,
  toolbar: css`
    padding: 12px 16px;
    background: ${token.colorBgContainer};
    border-bottom: 1px solid ${token.colorBorderSecondary};
    flex-shrink: 0;
  `,
  content: css`
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  `,
  loading: css`
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  error: css`
    margin: 16px;
  `,
  nodesPanel: css`
    position: absolute;
    left: 16px;
    top: 16px;
    z-index: 10;
    width: 280px;
    height: calc(100% - 32px);
    max-height: calc(100% - 32px);
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    box-shadow: ${token.boxShadow};
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `
}));

interface WorkflowProps {
  id?: string;
}

const WorkflowInner = memo<WorkflowProps>(({ id }) => {
  const { styles } = useStyles();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workflowData, setWorkflowData] = useState<LobeFlowData | null>(null);

  const {
    currentWorkflow,
    isWorkflowModified,
    loadWorkflow,
    updateWorkflow,
    saveWorkflow,
    updateWorkflowMeta
  } = useAgentStore((s) => ({
    currentWorkflow: s.currentWorkflow,
    isWorkflowModified: s.isWorkflowModified,
    loadWorkflow: s.loadWorkflow,
    updateWorkflow: s.updateWorkflow,
    saveWorkflow: s.saveWorkflow,
    updateWorkflowMeta: s.updateWorkflowMeta
  }));

  // 加载工作流数据
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError('未提供代理ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        await loadWorkflow(id);
      } catch (err) {
        console.error('加载工作流失败:', err);
        setError(err instanceof Error ? err.message : '加载工作流时发生错误');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, loadWorkflow]);

  // 将旧格式转换为新格式
  useEffect(() => {
    if (currentWorkflow) {
      // 如果是旧格式，转换为新格式
      if ('nodes' in currentWorkflow && 'edges' in currentWorkflow) {
        const flowData: LobeFlowData = {
          nodes: (currentWorkflow.nodes || []) as any[],
          edges: (currentWorkflow.edges || []) as any[],
          viewport: { x: 0, y: 0, zoom: 1 }
        };
        setWorkflowData(flowData);
      }
    }
  }, [currentWorkflow]);

  // 处理工作流更新
  const handleWorkflowChange = useCallback((data: LobeFlowData) => {
    setWorkflowData(data);
    // 更新到store（转换回旧格式）
    updateWorkflow({
      nodes: data.nodes as any[], // 临时类型转换
      edges: data.edges as any[], // 临时类型转换
      version: '1.0'
    });
  }, [updateWorkflow]);

  // 处理保存
  const handleSave = useCallback(async () => {
    try {
      await saveWorkflow();
      console.log('工作流已保存');
    } catch (error) {
      console.error('保存工作流失败:', error);
    }
  }, [saveWorkflow]);

  // 处理创建新工作流 - 使用默认模板
  const handleCreate = useCallback(() => {
    // 创建默认的三节点模板：输入-智能体-输出
    const defaultNodes = [
      {
        id: 'input-node',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          label: '输入节点',
          nodeType: 'input'
        }
      },
      {
        id: 'agent-node',
        type: 'custom',
        position: { x: 300, y: 100 },
        data: {
          label: '智能体节点',
          nodeType: 'agent'
        }
      },
      {
        id: 'output-node',
        type: 'custom',
        position: { x: 500, y: 100 },
        data: {
          label: '输出节点',
          nodeType: 'output'
        }
      }
    ];

    const defaultEdges = [
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

    const newFlow: LobeFlowData = {
      nodes: defaultNodes as any[],
      edges: defaultEdges as any[],
      viewport: { x: 0, y: 0, zoom: 1 }
    };

    setWorkflowData(newFlow);
    updateWorkflow({
      nodes: defaultNodes as any[],
      edges: defaultEdges as any[],
      version: '1.0'
    });
    updateWorkflowMeta({
      name: '新工作流',
      description: '包含输入-智能体-输出节点的默认工作流模板'
    });
  }, [updateWorkflow, updateWorkflowMeta]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spin size="large">
          <div style={{ marginTop: 20 }}>加载工作流中...</div>
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        className={styles.error}
        message="加载工作流失败"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div className={styles.container}>
      {workflowData ? (
        <ReactFlowProvider>
          <div className={styles.toolbar}>
            <FlowmixToolbar
              onSave={handleSave}
              onCreate={handleCreate}
              isModified={isWorkflowModified}
              agentId={id}
            />
          </div>
          <div className={styles.content}>
            <div className={`${styles.nodesPanel} workflow-nodes-panel`}>
              <FlowmixNodes />
            </div>
            <FlowmixCanvas
              initialData={workflowData}
              onChange={handleWorkflowChange}
              skipProvider={true}
            />
          </div>
        </ReactFlowProvider>
      ) : (
        <div className={styles.toolbar}>
          <FlowmixToolbar
            onSave={handleSave}
            onCreate={handleCreate}
            isModified={isWorkflowModified}
            agentId={id}
          />
        </div>
      )}
    </div>
  );
});

WorkflowInner.displayName = 'WorkflowInner';

export const Workflow = memo(WorkflowInner);
export default Workflow;
