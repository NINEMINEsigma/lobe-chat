'use client';

import React, { memo } from 'react';
import { Card, Row, Col, Typography, Tag, Descriptions, Space, Badge } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';
import {
  InfoCircleOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

import { AppNode } from '../../../core/types/Common';
import { ExecutionContext } from '../../../core/types/NodePlugin';

const { Title, Text, Paragraph } = Typography;

interface NodeBasicInfoProps {
  node: AppNode | null;
  data: any;
  onChange: (field: string, value: any) => void;
  executionContext?: ExecutionContext;
}

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    .ant-card {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    }
  `,

  infoSection: css`
    background: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  `,

  statusBadge: css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
  `,

  executionInfo: css`
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 8px;
    padding: 12px;
    margin-top: 12px;
  `,

  nodeTypeIndicator: css`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 20px;
    font-weight: 500;
  `,

  metricCard: css`
    text-align: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.3);
  `,

  connectionStatus: css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  `
}));

const NodeBasicInfo: React.FC<NodeBasicInfoProps> = memo(({
  node,
  data,
  onChange,
  executionContext
}) => {
  const { styles } = useStyles();
  const { t } = useTranslation('workflow');

  if (!node) return null;

  // 获取节点类型
  const getNodeType = (node: AppNode | null): string => {
    if (!node) return 'unknown';
    return node.data?.nodeType || node.type || 'unknown';
  };

  // 获取节点状态
  const getNodeStatus = () => {
    if (executionContext?.executionHistory?.[node.id]) {
      const history = executionContext.executionHistory[node.id];
      const lastExecution = history[history.length - 1];
      return lastExecution?.status || 'idle';
    }
    return 'idle';
  };

  // 获取状态颜色和图标
  const getStatusInfo = (status: string) => {
    const statusMap = {
      idle: { color: 'default', icon: <ClockCircleOutlined />, text: t('nodeStatus.idle') },
      running: { color: 'processing', icon: <PlayCircleOutlined />, text: t('nodeStatus.running') },
      completed: { color: 'success', icon: <InfoCircleOutlined />, text: t('nodeStatus.completed') },
      error: { color: 'error', icon: <InfoCircleOutlined />, text: t('nodeStatus.error') }
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.idle;
  };

  // 获取节点类型信息
  const getNodeTypeInfo = (type: string) => {
    const typeMap = {
      input: {
        color: 'blue',
        description: t('nodeTypes.input.description'),
        capabilities: [t('nodeTypes.input.capabilities.userInput'), t('nodeTypes.input.capabilities.textOutput')]
      },
      agent: {
        color: 'purple',
        description: t('nodeTypes.agent.description'),
        capabilities: [t('nodeTypes.agent.capabilities.textProcessing'), t('nodeTypes.agent.capabilities.aiGeneration')]
      },
      output: {
        color: 'green',
        description: t('nodeTypes.output.description'),
        capabilities: [t('nodeTypes.output.capabilities.resultDisplay'), t('nodeTypes.output.capabilities.finalOutput')]
      }
    };

    return typeMap[type as keyof typeof typeMap] || typeMap.input;
  };

  const currentNodeType = getNodeType(node);
  const nodeStatus = getNodeStatus();
  const statusInfo = getStatusInfo(nodeStatus);
  const typeInfo = getNodeTypeInfo(currentNodeType);

  // 计算执行统计
  const executionStats = executionContext?.executionHistory?.[node.id] || [];
  const successCount = executionStats.filter(ex => ex.status === 'completed').length;
  const errorCount = executionStats.filter(ex => ex.status === 'error').length;

  return (
    <div className={styles.container}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>

        {/* 节点基础信息 */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined />
              {t('nodeDetail.basic.title')}
            </Space>
          }
          size="small"
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label={t('nodeDetail.basic.id')}>
              <Text code>{node.id}</Text>
            </Descriptions.Item>

            <Descriptions.Item label={t('nodeDetail.basic.type')}>
              <div className={styles.nodeTypeIndicator}>
                <Tag color={typeInfo.color}>{currentNodeType.toUpperCase()}</Tag>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t('nodeDetail.basic.status')} span={2}>
              <Badge
                status={statusInfo.color as any}
                text={
                  <span className={styles.statusBadge}>
                    {statusInfo.icon}
                    {statusInfo.text}
                  </span>
                }
              />
            </Descriptions.Item>

            <Descriptions.Item label={t('nodeDetail.basic.position')} span={2}>
              <Text>
                X: {Math.round(node.position?.x || 0)}, Y: {Math.round(node.position?.y || 0)}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 节点类型信息 */}
        <Card
          title={
            <Space>
              <SettingOutlined />
              {t('nodeDetail.basic.typeInfo')}
            </Space>
          }
          size="small"
        >
          <div className={styles.infoSection}>
            <Paragraph>
              <Text strong>{t('nodeDetail.basic.description')}: </Text>
              <Text>{typeInfo.description}</Text>
            </Paragraph>

            <div>
              <Text strong>{t('nodeDetail.basic.capabilities')}: </Text>
              <div style={{ marginTop: 8 }}>
                {typeInfo.capabilities.map((capability, index) => (
                  <Tag key={index} style={{ marginBottom: 4 }}>
                    {capability}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* 执行统计 */}
        {executionContext && (
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                {t('nodeDetail.basic.executionStats')}
              </Space>
            }
            size="small"
          >
            <Row gutter={16}>
              <Col span={8}>
                <div className={styles.metricCard}>
                  <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                    {executionStats.length}
                  </Title>
                  <Text type="secondary">{t('nodeDetail.basic.totalExecutions')}</Text>
                </div>
              </Col>

              <Col span={8}>
                <div className={styles.metricCard}>
                  <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                    {successCount}
                  </Title>
                  <Text type="secondary">{t('nodeDetail.basic.successfulExecutions')}</Text>
                </div>
              </Col>

              <Col span={8}>
                <div className={styles.metricCard}>
                  <Title level={3} style={{ margin: 0, color: '#ff4d4f' }}>
                    {errorCount}
                  </Title>
                  <Text type="secondary">{t('nodeDetail.basic.failedExecutions')}</Text>
                </div>
              </Col>
            </Row>

            {executionStats.length > 0 && (
              <div className={styles.executionInfo}>
                <Text strong>{t('nodeDetail.basic.lastExecution')}: </Text>
                <Text>
                  {new Date(executionStats[executionStats.length - 1].timestamp).toLocaleString()}
                </Text>
                {executionStats[executionStats.length - 1].duration && (
                  <>
                    <br />
                    <Text strong>{t('nodeDetail.basic.duration')}: </Text>
                    <Text>{executionStats[executionStats.length - 1].duration}ms</Text>
                  </>
                )}
              </div>
            )}
          </Card>
        )}

        {/* 连接信息 */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined />
              {t('nodeDetail.basic.connections')}
            </Space>
          }
          size="small"
        >
          <div className={styles.infoSection}>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>{t('nodeDetail.basic.inputConnections')}: </Text>
                <Badge count={node.data?.inputConnections?.length || 0} showZero />
              </Col>
              <Col span={12}>
                <Text strong>{t('nodeDetail.basic.outputConnections')}: </Text>
                <Badge count={node.data?.outputConnections?.length || 0} showZero />
              </Col>
            </Row>

            <div className={styles.connectionStatus}>
              <Text type="secondary">
                {t('nodeDetail.basic.canExecute')}:
              </Text>
              <Badge
                status={currentNodeType === 'input' || (node.data?.inputConnections?.length > 0) ? 'success' : 'error'}
                text={
                  currentNodeType === 'input' || (node.data?.inputConnections?.length > 0)
                    ? t('common.yes')
                    : t('common.no')
                }
              />
            </div>
          </div>
        </Card>

      </Space>
    </div>
  );
});

NodeBasicInfo.displayName = 'NodeBasicInfo';

export default NodeBasicInfo;