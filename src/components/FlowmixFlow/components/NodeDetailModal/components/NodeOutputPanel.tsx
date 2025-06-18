'use client';

import React, { memo } from 'react';
import { Card, Typography, Tag, Empty, Space, Alert, Descriptions, Progress } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';
import {
  ExportOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  DownloadOutlined
} from '@ant-design/icons';

import { AppNode } from '../../../core/types/Common';
import { ExecutionContext } from '../../../core/types/NodePlugin';

const { Title, Text, Paragraph } = Typography;

interface NodeOutputPanelProps {
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
      margin-bottom: 16px;
    }
  `,

  outputCard: css`
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  `,

  dataPreview: css`
    background: rgba(248, 250, 252, 0.8);
    border: 1px solid rgba(226, 232, 240, 0.6);
    border-radius: 6px;
    padding: 12px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    line-height: 1.4;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 300px;
    overflow-y: auto;
  `,

  outputStatus: css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  `,

  typeTag: css`
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: rgba(34, 197, 94, 0.9);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
  `,

  executionInfo: css`
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 8px;
    padding: 12px;
    margin-top: 12px;
  `,

  streamingOutput: css`
    background: rgba(255, 247, 237, 0.8);
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 6px;
    padding: 12px;
    margin-top: 8px;
  `,

  outputMetrics: css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-top: 12px;
  `,

  metricItem: css`
    text-align: center;
    padding: 8px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.3);
  `
}));

const NodeOutputPanel: React.FC<NodeOutputPanelProps> = memo(({
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

  // 获取节点输出规范
  const getOutputSpecification = (nodeType: string) => {
    switch (nodeType) {
      case 'input':
        return {
          description: t('nodeTypes.input.outputSpec.description'),
          dataType: 'string',
          parameters: [
            {
              name: 'userInput',
              type: 'string',
              description: t('nodeTypes.input.outputSpec.userInputParam')
            }
          ],
          hasOutputPort: true,
          exampleData: '用户输入的文本内容'
        };

      case 'agent':
        return {
          description: t('nodeTypes.agent.outputSpec.description'),
          dataType: 'string',
          parameters: [
            {
              name: 'response',
              type: 'string',
              description: t('nodeTypes.agent.outputSpec.responseParam')
            }
          ],
          hasOutputPort: true,
          exampleData: '这是AI代理生成的回答内容，基于输入的文本进行处理后的结果。'
        };

      case 'output':
        return {
          description: t('nodeTypes.output.outputSpec.description'),
          dataType: 'none',
          parameters: [],
          hasOutputPort: false,
          exampleData: null
        };

      default:
        return {
          description: t('nodeTypes.unknown.outputSpec.description'),
          dataType: 'unknown',
          parameters: [],
          hasOutputPort: false,
          exampleData: null
        };
    }
  };

  // 获取当前输出数据
  const getCurrentOutputData = () => {
    if (executionContext?.nodeOutputs?.[node.id]) {
      return executionContext.nodeOutputs[node.id];
    }
    return data?.outputValue || null;
  };

  // 获取执行状态
  const getExecutionStatus = () => {
    if (executionContext?.executionHistory?.[node.id]) {
      const history = executionContext.executionHistory[node.id];
      const lastExecution = history[history.length - 1];
      return lastExecution || null;
    }
    return null;
  };

  // 检查输出连接状态
  const getOutputConnectionStatus = () => {
    const hasConnection = (node.data?.outputConnections?.length || 0) > 0;
    const currentNodeType = getNodeType(node);
    const isOutputNode = currentNodeType === 'output';

    if (isOutputNode) {
      return {
        status: 'success',
        message: t('nodeDetail.output.outputNodeNoConnection'),
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      };
    }

    if (hasConnection) {
      return {
        status: 'success',
        message: t('nodeDetail.output.connectionActive'),
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      };
    }

    return {
      status: 'info',
      message: t('nodeDetail.output.noConnection'),
      icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />
    };
  };

  const currentNodeType = getNodeType(node);
  const outputSpec = getOutputSpecification(currentNodeType);
  const currentOutputData = getCurrentOutputData();
  const executionStatus = getExecutionStatus();
  const connectionStatus = getOutputConnectionStatus();

  // 计算输出质量指标
  const getOutputMetrics = () => {
    if (!currentOutputData || typeof currentOutputData !== 'string') {
      return null;
    }

    return {
      length: currentOutputData.length,
      words: currentOutputData.split(/\s+/).filter(word => word.length > 0).length,
      lines: currentOutputData.split('\n').length,
      encoding: new TextEncoder().encode(currentOutputData).length
    };
  };

  const outputMetrics = getOutputMetrics();

  return (
    <div className={styles.container}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>

        {/* 输出规范信息 */}
        <Card
          title={
            <Space>
              <ExportOutlined />
              {t('nodeDetail.output.specification')}
            </Space>
          }
          size="small"
        >
          <Paragraph>
            <Text>{outputSpec.description}</Text>
          </Paragraph>

          <Descriptions size="small" column={1} bordered>
            <Descriptions.Item label={t('nodeDetail.output.hasOutputPort')}>
              <Tag color={outputSpec.hasOutputPort ? 'green' : 'orange'}>
                {outputSpec.hasOutputPort ? t('common.yes') : t('common.no')}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t('nodeDetail.output.dataType')}>
              <span className={styles.typeTag}>
                {outputSpec.dataType}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label={t('nodeDetail.output.connectionStatus')}>
              <div className={styles.outputStatus}>
                {connectionStatus.icon}
                <Text type={connectionStatus.status === 'success' ? 'success' : 'default'}>
                  {connectionStatus.message}
                </Text>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 输出参数列表 */}
        {outputSpec.parameters.length > 0 && (
          <Card
            title={
              <Space>
                <InfoCircleOutlined />
                {t('nodeDetail.output.parameters')}
              </Space>
            }
            size="small"
          >
            {outputSpec.parameters.map((param, index) => (
              <div key={index} className={styles.outputCard}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>{param.name}</Text>
                    <span className={styles.typeTag}>{param.type}</span>
                  </div>
                  <Text type="secondary">{param.description}</Text>
                </Space>
              </div>
            ))}
          </Card>
        )}

        {/* 当前输出数据预览 */}
        <Card
          title={
            <Space>
              <DownloadOutlined />
              {t('nodeDetail.output.currentData')}
            </Space>
          }
          size="small"
        >
          {currentOutputData ? (
            <div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>{t('nodeDetail.output.dataPreview')}: </Text>
                <span className={styles.typeTag}>
                  {typeof currentOutputData}
                </span>
              </div>

              {/* 输出内容 */}
              <div className={styles.dataPreview}>
                {typeof currentOutputData === 'string'
                  ? currentOutputData
                  : JSON.stringify(currentOutputData, null, 2)
                }
              </div>

              {/* 输出指标 */}
              {outputMetrics && (
                <div className={styles.outputMetrics}>
                  <div className={styles.metricItem}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                      {outputMetrics.length}
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {t('nodeDetail.output.characters')}
                    </Text>
                  </div>

                  <div className={styles.metricItem}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                      {outputMetrics.words}
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {t('nodeDetail.output.words')}
                    </Text>
                  </div>

                  <div className={styles.metricItem}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fa8c16' }}>
                      {outputMetrics.lines}
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {t('nodeDetail.output.lines')}
                    </Text>
                  </div>

                  <div className={styles.metricItem}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#722ed1' }}>
                      {Math.round(outputMetrics.encoding / 1024 * 100) / 100}KB
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {t('nodeDetail.output.size')}
                    </Text>
                  </div>
                </div>
              )}

              {/* 执行信息 */}
              {executionStatus && (
                <div className={styles.executionInfo}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>{t('nodeDetail.output.generatedAt')}: </Text>
                      <Text>{new Date(executionStatus.timestamp).toLocaleString()}</Text>
                    </div>

                    {executionStatus.duration && (
                      <div>
                        <Text strong>{t('nodeDetail.output.processingTime')}: </Text>
                        <Text>{executionStatus.duration}ms</Text>
                      </div>
                    )}

                    {executionStatus.status === 'running' && (
                      <div className={styles.streamingOutput}>
                        <Space>
                          <LoadingOutlined />
                          <Text>{t('nodeDetail.output.generating')}</Text>
                        </Space>
                        <Progress
                          percent={70}
                          size="small"
                          status="active"
                          style={{ marginTop: 8 }}
                        />
                      </div>
                    )}
                  </Space>
                </div>
              )}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical">
                  <Text type="secondary">
                    {node.type === 'output'
                      ? t('nodeDetail.output.noOutputData')
                      : t('nodeDetail.output.notExecuted')
                    }
                  </Text>
                  {outputSpec.exampleData && (
                    <div>
                      <Text strong>{t('nodeDetail.output.exampleData')}: </Text>
                      <div className={styles.dataPreview} style={{ marginTop: 8 }}>
                        {outputSpec.exampleData}
                      </div>
                    </div>
                  )}
                </Space>
              }
            />
          )}
        </Card>

        {/* 下游连接信息 */}
        {node.type !== 'output' && (
          <Card
            title={
              <Space>
                <InfoCircleOutlined />
                {t('nodeDetail.output.downstreamNodes')}
              </Space>
            }
            size="small"
          >
            {(node.data?.outputConnections?.length || 0) > 0 ? (
              <div>
                <Text>
                  {t('nodeDetail.output.connectedTo')} {node.data?.outputConnections?.length || 0} {t('nodeDetail.output.nodes')}
                </Text>
                <div style={{ marginTop: 8 }}>
                  {(node.data?.outputConnections || []).map((connectionId: string, index: number) => (
                    <Tag key={index} style={{ marginBottom: 4 }}>
                      {connectionId}
                    </Tag>
                  ))}
                </div>
              </div>
            ) : (
              <Alert
                message={t('nodeDetail.output.noDownstreamConnections')}
                description={t('nodeDetail.output.noDownstreamConnectionsDesc')}
                type="info"
                showIcon
                style={{
                  background: 'rgba(24, 144, 255, 0.1)',
                  border: '1px solid rgba(24, 144, 255, 0.3)',
                }}
              />
            )}
          </Card>
        )}

      </Space>
    </div>
  );
});

NodeOutputPanel.displayName = 'NodeOutputPanel';

export default NodeOutputPanel;