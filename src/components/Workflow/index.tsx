'use client';

import React, { memo, useEffect, useState, useCallback } from 'react';
import { Flex, Spin, Alert, Button } from 'antd';
import { createStyles } from 'antd-style';

import { useAgentStore } from '@/store/agent';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    height: 100%;
    width: 100%;
    background: ${token.colorBgLayout};
    display: flex;
    flex-direction: column;
  `,
  content: css`
    flex: 1;
    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;
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
  placeholder: css`
    text-align: center;
    color: ${token.colorTextSecondary};

    h3 {
      margin-bottom: 16px;
      color: ${token.colorText};
    }

    p {
      margin-bottom: 24px;
      font-size: 16px;
    }
  `
}));

interface WorkflowProps {
  id?: string;
}

const WorkflowInner = memo<WorkflowProps>(({ id }) => {
  const { styles } = useStyles();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 模拟加载过程
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleCreateWorkflow = useCallback(() => {
    // TODO: 实现创建工作流功能
    console.log('创建新工作流');
  }, []);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" tip="加载工作流中..." />
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
      <div className={styles.content}>
        <div className={styles.placeholder}>
          <h3>工作流编辑器</h3>
          <p>FlowmixFlow 工作流系统正在开发中</p>
          <p>代理ID: {id || '未指定'}</p>
          <Button type="primary" onClick={handleCreateWorkflow}>
            创建新工作流
          </Button>
        </div>
      </div>
    </div>
  );
});

WorkflowInner.displayName = 'WorkflowInner';

export const Workflow = memo(WorkflowInner);
export default Workflow;
