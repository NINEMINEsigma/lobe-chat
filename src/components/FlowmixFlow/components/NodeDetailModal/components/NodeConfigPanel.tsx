'use client';

import React, { memo } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Slider,
  Typography,
  Space,
  Divider,
  Alert
} from 'antd';
import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';
import {
  SettingOutlined,
  InfoCircleOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  AimOutlined
} from '@ant-design/icons';

import { AppNode } from '../../../core/types/Common';
import { ExecutionContext } from '../../../core/types/NodePlugin';
import MultiInputConfigPanel from './MultiInputConfigPanel';
import { getDefaultMultiInputConfig } from '@/utils/workflow/multiInputCollector';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface NodeConfigPanelProps {
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

  configSection: css`
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  `,

  formItem: css`
    .ant-form-item-label {
      font-weight: 500;
    }

    .ant-form-item-explain {
      color: ${token.colorTextTertiary};
      font-size: 12px;
    }
  `,

  sliderContainer: css`
    .ant-slider {
      margin: 16px 0;
    }

    .ant-slider-track {
      background: linear-gradient(90deg, #1890ff 0%, #722ed1 100%);
    }

    .ant-slider-handle {
      border: 2px solid #1890ff;
    }
  `,

  advancedConfig: css`
    background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
    border: 1px solid rgba(147, 51, 234, 0.2);
    border-radius: 8px;
    padding: 16px;
  `,

  configPreview: css`
    background: rgba(248, 250, 252, 0.8);
    border: 1px solid rgba(226, 232, 240, 0.6);
    border-radius: 6px;
    padding: 12px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    line-height: 1.4;
    margin-top: 12px;
  `
}));

const NodeConfigPanel: React.FC<NodeConfigPanelProps> = memo(({
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

  // 获取可用的上游节点
  const getAvailableUpstreamNodes = () => {
    if (!node || !node.data?.inputConnectionDetails) {
      return [];
    }

    return node.data.inputConnectionDetails.map((connection: any) => ({
      id: connection.sourceNodeId,
      label: connection.sourceNodeLabel || connection.sourceNodeId,
      type: connection.sourceNodeType || 'unknown'
    }));
  };

  // 渲染输入节点配置
  const renderInputNodeConfig = () => (
    <div className={styles.configSection}>
      <Title level={5}>
        <Space>
          <AimOutlined />
          {t('nodeDetail.config.inputConfig')}
        </Space>
      </Title>

      <Form layout="vertical" className={styles.formItem}>
        <Form.Item
          label={t('nodeDetail.config.placeholder')}
          help={t('nodeDetail.config.placeholderHelp')}
        >
          <Input
            value={data?.placeholder || ''}
            onChange={(e) => onChange('placeholder', e.target.value)}
            placeholder={t('nodeDetail.config.placeholderExample')}
          />
        </Form.Item>

        <Form.Item
          label={t('nodeDetail.config.defaultValue')}
          help={t('nodeDetail.config.defaultValueHelp')}
        >
          <TextArea
            value={data?.defaultValue || ''}
            onChange={(e) => onChange('defaultValue', e.target.value)}
            placeholder={t('nodeDetail.config.defaultValueExample')}
            rows={3}
          />
        </Form.Item>

        <Form.Item
          label={t('nodeDetail.config.validation')}
          help={t('nodeDetail.config.validationHelp')}
        >
          <Space>
            <Switch
              checked={data?.validation?.required || false}
              onChange={(checked) => onChange('validation', {
                ...data?.validation,
                required: checked
              })}
            />
            <Text>{t('nodeDetail.config.required')}</Text>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );

  // 渲染AI代理节点配置
  const renderAgentNodeConfig = () => (
    <div className={styles.configSection}>
      <Title level={5}>
        <Space>
          <ExperimentOutlined />
          {t('nodeDetail.config.agentConfig')}
        </Space>
      </Title>

      <Form layout="vertical" className={styles.formItem}>
        <Form.Item
          label={t('nodeDetail.config.temperature')}
          help={t('nodeDetail.config.temperatureHelp')}
        >
          <div className={styles.sliderContainer}>
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={data?.modelConfig?.temperature || 0.7}
              onChange={(value) => onChange('modelConfig', {
                ...data?.modelConfig,
                temperature: value
              })}
              marks={{
                0: '0',
                0.7: '0.7',
                1: '1',
                2: '2'
              }}
            />
          </div>
          <Text type="secondary">
            {t('nodeDetail.config.currentValue')}: {data?.modelConfig?.temperature || 0.7}
          </Text>
        </Form.Item>

        <Form.Item
          label={t('nodeDetail.config.maxTokens')}
          help={t('nodeDetail.config.maxTokensHelp')}
        >
          <InputNumber
            min={1}
            max={4096}
            value={data?.modelConfig?.maxTokens || 1024}
            onChange={(value) => onChange('modelConfig', {
              ...data?.modelConfig,
              maxTokens: value
            })}
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* 🚀 FUTURE: 扩展配置项 - 暂时注释保留用于后续功能增强 */}
        <div className={styles.advancedConfig}>
          <Text strong>{t('nodeDetail.config.advancedSettings')}</Text>
          <Paragraph type="secondary" style={{ fontSize: '12px', marginTop: 8 }}>
            {t('nodeDetail.config.advancedSettingsDesc')}
          </Paragraph>

          {/* 预留配置项 */}
          <Form.Item
            label={t('nodeDetail.config.systemPrompt')}
            help={t('nodeDetail.config.systemPromptHelp')}
            style={{ marginTop: 16 }}
          >
            <TextArea
              value={data?.modelConfig?.systemPrompt || ''}
              onChange={(e) => onChange('modelConfig', {
                ...data?.modelConfig,
                systemPrompt: e.target.value
              })}
              placeholder={t('nodeDetail.config.systemPromptExample')}
              rows={3}
              disabled={true}
            />
            <Alert
              message={t('nodeDetail.config.featureComingSoon')}
              type="info"
              style={{ marginTop: 8 }}
            />
          </Form.Item>

          {/* 其他高级配置 */}
          {/*
          <Form.Item label={t('nodeDetail.config.topP')}>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={data?.modelConfig?.topP || 1}
              onChange={(value) => onChange('modelConfig', {
                ...data?.modelConfig,
                topP: value
              })}
              disabled={true}
            />
          </Form.Item>
          */}
        </div>
      </Form>
    </div>
  );

  // 渲染输出节点配置
  const renderOutputNodeConfig = () => (
    <>
      {/* 多输入配置面板 */}
      <MultiInputConfigPanel
        config={data?.multiInputConfig || getDefaultMultiInputConfig()}
        onChange={(config) => onChange('multiInputConfig', config)}
        availableNodes={getAvailableUpstreamNodes()}
      />

      <div className={styles.configSection}>
        <Title level={5}>
          <Space>
            <ThunderboltOutlined />
            {t('nodeDetail.config.outputConfig')}
          </Space>
        </Title>

        <Form layout="vertical" className={styles.formItem}>
          <Form.Item
            label={t('nodeDetail.config.displayFormat')}
            help={t('nodeDetail.config.displayFormatHelp')}
          >
            <Select
              value={data?.displayConfig?.format || 'text'}
              onChange={(value) => onChange('displayConfig', {
                ...data?.displayConfig,
                format: value
              })}
              style={{ width: '100%' }}
            >
              <Option value="text">{t('nodeDetail.config.formats.text')}</Option>
              <Option value="markdown" disabled>{t('nodeDetail.config.formats.markdown')}</Option>
              <Option value="json" disabled>{t('nodeDetail.config.formats.json')}</Option>
              <Option value="code" disabled>{t('nodeDetail.config.formats.code')}</Option>
            </Select>
            {data?.displayConfig?.format !== 'text' && (
              <Alert
                message={t('nodeDetail.config.featureComingSoon')}
                type="info"
                style={{ marginTop: 8 }}
              />
            )}
          </Form.Item>

          <Form.Item
            label={t('nodeDetail.config.autoScroll')}
            help={t('nodeDetail.config.autoScrollHelp')}
          >
            <Switch
              checked={data?.displayConfig?.autoScroll !== false}
              onChange={(checked) => onChange('displayConfig', {
                ...data?.displayConfig,
                autoScroll: checked
              })}
            />
          </Form.Item>

          <Form.Item
            label={t('nodeDetail.config.showTimestamp')}
            help={t('nodeDetail.config.showTimestampHelp')}
          >
            <Switch
              checked={data?.displayConfig?.showTimestamp === true}
              onChange={(checked) => onChange('displayConfig', {
                ...data?.displayConfig,
                showTimestamp: checked
              })}
            />
          </Form.Item>
        </Form>
      </div>
    </>
  );

  // 渲染通用配置
  const renderGeneralConfig = () => (
    <div className={styles.configSection}>
      <Title level={5}>
        <Space>
          <SettingOutlined />
          {t('nodeDetail.config.generalConfig')}
        </Space>
      </Title>

      <Form layout="vertical" className={styles.formItem}>
        <Form.Item
          label={t('nodeDetail.config.nodeName')}
          help={t('nodeDetail.config.nodeNameHelp')}
        >
          <Input
            value={data?.name || node.id}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder={t('nodeDetail.config.nodeNameExample')}
          />
        </Form.Item>

        <Form.Item
          label={t('nodeDetail.config.description')}
          help={t('nodeDetail.config.descriptionHelp')}
        >
          <TextArea
            value={data?.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder={t('nodeDetail.config.descriptionExample')}
            rows={2}
          />
        </Form.Item>

        <Form.Item
          label={t('nodeDetail.config.enabled')}
          help={t('nodeDetail.config.enabledHelp')}
        >
          <Switch
            checked={data?.enabled !== false}
            onChange={(checked) => onChange('enabled', checked)}
          />
        </Form.Item>

        <Form.Item
          label={t('nodeDetail.config.debugMode')}
          help={t('nodeDetail.config.debugModeHelp')}
        >
          <Switch
            checked={data?.debugMode === true}
            onChange={(checked) => onChange('debugMode', checked)}
          />
        </Form.Item>
      </Form>
    </div>
  );

  // 生成配置预览
  const generateConfigPreview = () => {
    const currentNodeType = getNodeType(node);
    const config = {
      nodeId: node.id,
      nodeType: currentNodeType,
      ...data
    };

    return JSON.stringify(config, null, 2);
  };

  const currentNodeType = getNodeType(node);

  return (
    <div className={styles.container}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>

        {/* 通用配置 */}
        {renderGeneralConfig()}

        <Divider />

        {/* 节点类型特定配置 */}
        {currentNodeType === 'input' && renderInputNodeConfig()}
        {currentNodeType === 'agent' && renderAgentNodeConfig()}
        {currentNodeType === 'output' && renderOutputNodeConfig()}

        <Divider />

        {/* 配置预览 */}
        <Card
          title={
            <Space>
              <InfoCircleOutlined />
              {t('nodeDetail.config.preview')}
            </Space>
          }
          size="small"
        >
          <Paragraph>
            <Text type="secondary">
              {t('nodeDetail.config.previewDescription')}
            </Text>
          </Paragraph>

          <div className={styles.configPreview}>
            {generateConfigPreview()}
          </div>
        </Card>

        {/* 配置说明 */}
        <Alert
          message={t('nodeDetail.config.configTips')}
          description={t('nodeDetail.config.configTipsDescription')}
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{
            background: 'rgba(24, 144, 255, 0.1)',
            border: '1px solid rgba(24, 144, 255, 0.3)',
          }}
        />

      </Space>
    </div>
  );
});

NodeConfigPanel.displayName = 'NodeConfigPanel';

export default NodeConfigPanel;