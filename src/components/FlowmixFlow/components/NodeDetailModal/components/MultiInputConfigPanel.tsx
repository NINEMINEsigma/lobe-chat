/**
 * 多输入配置面板组件
 * 为输出节点提供多输入处理的配置界面
 */

import React, { memo } from 'react';
import { Card, Select, Switch, Input, Space, Divider, Typography, Tooltip, Alert } from 'antd';
import { InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';

import { MultiInputConfig, InputMergeStrategy } from '@/types/workflow/nodeTypes';
import ParameterMappingPanel from './ParameterMappingPanel';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface MultiInputConfigPanelProps {
  config: MultiInputConfig;
  onChange: (config: MultiInputConfig) => void;
  disabled?: boolean;
  availableNodes?: Array<{ id: string; label: string; type: string }>;
}

const useStyles = createStyles(({ token, css }) => ({
  configPanel: css`
    .ant-card-body {
      padding: 16px;
    }
  `,

  configItem: css`
    margin-bottom: 12px;

    .ant-typography {
      margin-bottom: 4px;
    }
  `,

  strategyDescription: css`
    font-size: 12px;
    color: ${token.colorTextSecondary};
    margin-top: 4px;
    padding: 8px;
    background: ${token.colorFillTertiary};
    border-radius: 4px;
  `,

  templateHelper: css`
    font-size: 12px;
    color: ${token.colorTextSecondary};
    margin-top: 4px;

    code {
      background: ${token.colorFillSecondary};
      padding: 2px 4px;
      border-radius: 2px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
  `,

  enableSwitch: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: ${token.colorFillTertiary};
    border-radius: 6px;
    margin-bottom: 16px;
  `
}));

const MultiInputConfigPanel: React.FC<MultiInputConfigPanelProps> = memo(({
  config,
  onChange,
  disabled = false,
  availableNodes = []
}) => {
  const { styles } = useStyles();
  const { t } = useTranslation('workflow');

  // 策略选项
  const strategyOptions = [
    {
      value: InputMergeStrategy.CONCAT,
      label: t('multiInput.strategy.concat', { defaultValue: '字符串拼接' }),
      description: t('multiInput.strategy.concatDesc', { defaultValue: '将多个输入用分隔符连接成一个字符串' })
    },
    {
      value: InputMergeStrategy.ARRAY,
      label: t('multiInput.strategy.array', { defaultValue: '数组合并' }),
      description: t('multiInput.strategy.arrayDesc', { defaultValue: '将多个输入合并为JSON数组格式' })
    },
    {
      value: InputMergeStrategy.FIRST,
      label: t('multiInput.strategy.first', { defaultValue: '使用第一个' }),
      description: t('multiInput.strategy.firstDesc', { defaultValue: '只使用第一个输入，忽略其他输入' })
    },
    {
      value: InputMergeStrategy.LAST,
      label: t('multiInput.strategy.last', { defaultValue: '使用最后一个' }),
      description: t('multiInput.strategy.lastDesc', { defaultValue: '只使用最后一个输入，忽略其他输入' })
    },
    {
      value: InputMergeStrategy.TEMPLATE,
      label: t('multiInput.strategy.template', { defaultValue: '模板替换' }),
      description: t('multiInput.strategy.templateDesc', { defaultValue: '使用自定义模板处理多个输入' })
    }
  ];

  // 获取当前策略的描述
  const getCurrentStrategyDescription = () => {
    const strategy = strategyOptions.find(opt => opt.value === config.strategy);
    return strategy?.description || '';
  };

  // 处理配置变更
  const handleConfigChange = (updates: Partial<MultiInputConfig>) => {
    onChange({
      ...config,
      ...updates
    });
  };

  // 处理启用/禁用切换
  const handleEnableToggle = (enabled: boolean) => {
    handleConfigChange({ enabled });
  };

  // 处理策略变更
  const handleStrategyChange = (strategy: InputMergeStrategy) => {
    const updates: Partial<MultiInputConfig> = { strategy };

    // 根据策略设置默认值
    switch (strategy) {
      case InputMergeStrategy.CONCAT:
        updates.separator = config.separator || '\n';
        break;
      case InputMergeStrategy.TEMPLATE:
        updates.template = config.template || '{{all}}';
        break;
      default:
        break;
    }

    handleConfigChange(updates);
  };

  return (
    <Card
      title={
        <Space>
          <SettingOutlined />
          {t('multiInput.title', { defaultValue: '多输入配置' })}
        </Space>
      }
      size="small"
      className={styles.configPanel}
    >
      {/* 启用开关 */}
      <div className={styles.enableSwitch}>
        <Space>
          <Text strong>{t('multiInput.enable', { defaultValue: '启用多输入处理' })}</Text>
          <Tooltip title={t('multiInput.enableTooltip', { defaultValue: '启用后可以处理来自多个节点的输入数据' })}>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
          </Tooltip>
        </Space>
        <Switch
          checked={config.enabled}
          onChange={handleEnableToggle}
          disabled={disabled}
        />
      </div>

            {/* 配置选项 */}
      {config.enabled && (
        <>
          {/* 处理模式选择 */}
          <div className={styles.configItem}>
            <Text strong>处理模式</Text>
            <Select
              value={config.useParameterMapping ? 'parameter' : 'merge'}
              onChange={(value) => handleConfigChange({ useParameterMapping: value === 'parameter' })}
              style={{ width: '100%', marginTop: 4 }}
              disabled={disabled}
            >
              <Select.Option value="merge">自动合并模式</Select.Option>
              <Select.Option value="parameter">参数映射模式</Select.Option>
            </Select>
            <div className={styles.strategyDescription}>
              {config.useParameterMapping
                ? '手动指定每个参数使用哪个节点的输出，提供精确的控制'
                : '自动收集所有输入并按策略合并，适合简单的多输入场景'
              }
            </div>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          {/* 参数映射模式 */}
          {config.useParameterMapping ? (
            <ParameterMappingPanel
              mappings={config.parameterMappings || []}
              availableNodes={availableNodes}
              onChange={(mappings) => handleConfigChange({ parameterMappings: mappings })}
              disabled={disabled}
            />
          ) : (
            <>
              {/* 合并策略选择 */}
              <div className={styles.configItem}>
                <Text strong>{t('multiInput.strategy.title', { defaultValue: '合并策略' })}</Text>
                <Select
                  value={config.strategy}
                  onChange={handleStrategyChange}
                  style={{ width: '100%', marginTop: 4 }}
                  disabled={disabled}
                  options={strategyOptions.map(opt => ({
                    value: opt.value,
                    label: opt.label
                  }))}
                />
                <div className={styles.strategyDescription}>
                  {getCurrentStrategyDescription()}
                </div>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              {/* 策略特定配置 */}
              {config.strategy === InputMergeStrategy.CONCAT && (
                <div className={styles.configItem}>
                  <Text strong>{t('multiInput.separator', { defaultValue: '分隔符' })}</Text>
                  <Input
                    value={config.separator || '\n'}
                    onChange={(e) => handleConfigChange({ separator: e.target.value })}
                    placeholder={t('multiInput.separatorPlaceholder', { defaultValue: '输入分隔符，如 \\n 或 , ' })}
                    disabled={disabled}
                    style={{ marginTop: 4 }}
                  />
                  <div className={styles.templateHelper}>
                    {t('multiInput.separatorHelper', { defaultValue: '支持转义字符：\\n (换行)、\\t (制表符)' })}
                  </div>
                </div>
              )}

              {config.strategy === InputMergeStrategy.TEMPLATE && (
                <div className={styles.configItem}>
                  <Text strong>{t('multiInput.template', { defaultValue: '模板字符串' })}</Text>
                  <TextArea
                    value={config.template || ''}
                    onChange={(e) => handleConfigChange({ template: e.target.value })}
                    placeholder={t('multiInput.templatePlaceholder', { defaultValue: '输入模板，如：第一个输入：{{0}}，第二个输入：{{1}}' })}
                    disabled={disabled}
                    rows={3}
                    style={{ marginTop: 4 }}
                  />
                  <div className={styles.templateHelper}>
                    <div>{t('multiInput.templateHelper', { defaultValue: '支持的占位符：' })}</div>
                    <div><code>{'{{0}}, {{1}}, {{2}}...'}</code> - {t('multiInput.templateHelperIndex', { defaultValue: '按索引引用输入' })}</div>
                    <div><code>{'{{all}}'}</code> - {t('multiInput.templateHelperAll', { defaultValue: '所有输入（换行分隔）' })}</div>
                    <div><code>{'{{count}}'}</code> - {t('multiInput.templateHelperCount', { defaultValue: '输入数量' })}</div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 提示信息 */}
          <Alert
            message={t('multiInput.notice', { defaultValue: '注意' })}
            description={config.useParameterMapping
              ? '参数映射模式允许您精确控制每个参数的来源。请确保配置了所有必需的参数映射。'
              : t('multiInput.noticeText', {
                  defaultValue: '多输入功能会自动收集所有连接到此节点的输入数据。如果只有一个输入连接，将自动使用单输入模式。'
                })
            }
            type="info"
            showIcon
            style={{ marginTop: 12 }}
          />
        </>
      )}
    </Card>
  );
});

MultiInputConfigPanel.displayName = 'MultiInputConfigPanel';

export default MultiInputConfigPanel;