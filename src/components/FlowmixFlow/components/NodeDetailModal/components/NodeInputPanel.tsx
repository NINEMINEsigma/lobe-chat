'use client';

import React, { memo } from 'react';
import { Card, Typography, Tag, Empty, Space, Alert, Descriptions } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';
import {
  ImportOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

import { AppNode } from '../../../core/types/Common';
import { ExecutionContext } from '../../../core/types/NodePlugin';

const { Title, Text, Paragraph } = Typography;

interface NodeInputPanelProps {
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

  parameterCard: css`
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
    max-height: 200px;
    overflow-y: auto;
  `,

  inputStatus: css`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  `,

  typeTag: css`
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: rgba(59, 130, 246, 0.9);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
  `,

  connectionInfo: css`
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 8px;
    padding: 12px;
    margin-top: 12px;
  `
}));

const NodeInputPanel: React.FC<NodeInputPanelProps> = memo(({
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

  // 获取节点输入规范
  const getInputSpecification = (nodeType: string) => {
    switch (nodeType) {
      case 'input':
        return {
          description: t('nodeTypes.input.inputSpec.description'),
          parameters: [],
          hasInputPort: false,
          dataType: 'none',
          exampleData: null
        };

      case 'agent':
        return {
          description: t('nodeTypes.agent.inputSpec.description'),
          parameters: [
            {
              name: 'text',
              type: 'string',
              required: true,
              description: t('nodeTypes.agent.inputSpec.textParam')
            }
          ],
          hasInputPort: true,
          dataType: 'string',
          exampleData: '这是输入给AI代理的文本内容示例'
        };

      case 'output':
        return {
          description: t('nodeTypes.output.inputSpec.description'),
          parameters: [
            {
              name: 'content',
              type: 'string',
              required: true,
              description: t('nodeTypes.output.inputSpec.contentParam')
            }
          ],
          hasInputPort: true,
          dataType: 'string',
          exampleData: '这是将要输出到会话的内容'
        };

      default:
        return {
          description: t('nodeTypes.unknown.inputSpec.description'),
          parameters: [],
          hasInputPort: false,
          dataType: 'unknown',
          exampleData: null
        };
    }
  };

  // 获取当前输入数据
  const getCurrentInputData = () => {
    if (executionContext?.nodeInputs?.[node.id]) {
      return executionContext.nodeInputs[node.id];
    }
    return data?.inputValue || null;
  };

  // 检查输入连接状态
  const getInputConnectionStatus = () => {
    const hasConnection = node.data?.inputConnections?.length > 0;
    const currentNodeType = getNodeType(node);
    const isInputNode = currentNodeType === 'input';

    if (isInputNode) {
      return {
        status: 'success',
        message: t('nodeDetail.input.inputNodeNoConnection'),
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      };
    }

    if (hasConnection) {
      return {
        status: 'success',
        message: t('nodeDetail.input.connectionActive'),
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      };
    }

    return {
      status: 'warning',
      message: t('nodeDetail.input.noConnection'),
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />
    };
  };

  const currentNodeType = getNodeType(node);
  const inputSpec = getInputSpecification(currentNodeType);
  const currentInputData = getCurrentInputData();
  const connectionStatus = getInputConnectionStatus();

  return (
    <div className={styles.container}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>

        {/* 输入规范信息 */}
        <Card
          title={
            <Space>
              <ImportOutlined />
              {t('nodeDetail.input.specification')}
            </Space>
          }
          size="small"
        >
          <Paragraph>
            <Text>{inputSpec.description}</Text>
          </Paragraph>

          <Descriptions size="small" column={1} bordered>
            <Descriptions.Item label={t('nodeDetail.input.hasInputPort')}>
              <Tag color={inputSpec.hasInputPort ? 'green' : 'orange'}>
                {inputSpec.hasInputPort ? t('common.yes') : t('common.no')}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t('nodeDetail.input.dataType')}>
              <span className={styles.typeTag}>
                {inputSpec.dataType}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label={t('nodeDetail.input.connectionStatus')}>
              <div className={styles.inputStatus}>
                {connectionStatus.icon}
                <Text type={connectionStatus.status === 'success' ? 'success' : 'warning'}>
                  {connectionStatus.message}
                </Text>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 输入参数列表 */}
        {inputSpec.parameters.length > 0 && (
          <Card
            title={
              <Space>
                <InfoCircleOutlined />
                {t('nodeDetail.input.parameters')}
              </Space>
            }
            size="small"
          >
            {inputSpec.parameters.map((param, index) => (
              <div key={index} className={styles.parameterCard}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>{param.name}</Text>
                    <Space>
                      <span className={styles.typeTag}>{param.type}</span>
                      {param.required && (
                        <Tag color="red" size="small">
                          {t('nodeDetail.input.required')}
                        </Tag>
                      )}
                    </Space>
                  </div>
                  <Text type="secondary">{param.description}</Text>
                </Space>
              </div>
            ))}
          </Card>
        )}

        {/* 当前输入数据预览 */}
        <Card
          title={
            <Space>
              <ImportOutlined />
              {t('nodeDetail.input.currentData')}
            </Space>
          }
          size="small"
        >
          {currentInputData ? (
            <div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>{t('nodeDetail.input.dataPreview')}: </Text>
                <span className={styles.typeTag}>
                  {typeof currentInputData} ({String(currentInputData).length} {t('common.characters')})
                </span>
              </div>

              <div className={styles.dataPreview}>
                {typeof currentInputData === 'string'
                  ? currentInputData
                  : JSON.stringify(currentInputData, null, 2)
                }
              </div>

              {executionContext?.executionHistory?.[node.id] && (
                <div className={styles.connectionInfo}>
                  <Text strong>{t('nodeDetail.input.lastReceived')}: </Text>
                  <Text>
                    {new Date(
                      executionContext.executionHistory[node.id][
                        executionContext.executionHistory[node.id].length - 1
                      ]?.timestamp || Date.now()
                    ).toLocaleString()}
                  </Text>
                </div>
              )}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical">
                  <Text type="secondary">
                    {node.type === 'input'
                      ? t('nodeDetail.input.noUserInput')
                      : t('nodeDetail.input.noInputData')
                    }
                  </Text>
                  {inputSpec.exampleData && (
                    <div>
                      <Text strong>{t('nodeDetail.input.exampleData')}: </Text>
                      <div className={styles.dataPreview} style={{ marginTop: 8 }}>
                        {inputSpec.exampleData}
                      </div>
                    </div>
                  )}
                </Space>
              }
            />
          )}
        </Card>

        {/* 连接提示信息 */}
        {node.type !== 'input' && !node.data?.inputConnections?.length && (
          <Alert
            message={t('nodeDetail.input.connectionRequired')}
            description={t('nodeDetail.input.connectionRequiredDesc')}
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
            style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
            }}
          />
        )}

      </Space>
    </div>
  );
});

NodeInputPanel.displayName = 'NodeInputPanel';

export default NodeInputPanel;