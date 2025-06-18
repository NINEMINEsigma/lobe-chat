import { memo, useCallback, useEffect, useState } from 'react';
import { Tooltip, Card, Space, Tag, Divider, Typography } from 'antd';
import { useTheme } from 'antd-style';
import { Icon } from '@lobehub/ui';
import { Info, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

import { NodeParameterSchema, ParameterMapping } from '@/utils/workflow/multiInputCollector';
import { checkParameterCompatibility, CompatibilityResult } from '@/utils/workflow/parameterCompatibility';

const { Text } = Typography;

interface ParameterPreviewProps {
  /** 源参数信息 */
  sourceParameter?: NodeParameterSchema;
  /** 目标参数信息 */
  targetParameter?: NodeParameterSchema;
  /** 参数映射配置 */
  parameterMapping?: ParameterMapping;
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 预览触发的子元素 */
  children: React.ReactElement;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 参数预览组件
 * 复用现有的Tooltip组件，提供悬停显示参数详细信息的功能
 */
const ParameterPreview = memo<ParameterPreviewProps>(({
  sourceParameter,
  targetParameter,
  parameterMapping,
  showDetails = true,
  children,
  className
}) => {
  const theme = useTheme();
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);

  // 计算兼容性
  useEffect(() => {
    if (sourceParameter && targetParameter) {
      setLoading(true);
      try {
        const result = checkParameterCompatibility(sourceParameter, targetParameter);
        setCompatibilityResult(result);
      } catch (error) {
        console.error('[ParameterPreview] 兼容性检查失败:', error);
        setCompatibilityResult(null);
      } finally {
        setLoading(false);
      }
    } else {
      setCompatibilityResult(null);
    }
  }, [sourceParameter, targetParameter]);

  // 获取兼容性指示器
  const getCompatibilityIndicator = useCallback(() => {
    if (!compatibilityResult) return null;

    const { compatibilityLevel, compatibilityScore } = compatibilityResult;

    let icon, color, text;

    switch (compatibilityLevel) {
      case 'exact':
        icon = CheckCircle;
        color = theme.colorSuccess;
        text = '完全匹配';
        break;
      case 'convertible':
        icon = Zap;
        color = theme.colorWarning;
        text = '可转换';
        break;
      case 'partial':
        icon = AlertTriangle;
        color = theme.colorWarning;
        text = '部分兼容';
        break;
      default:
        icon = AlertTriangle;
        color = theme.colorError;
        text = '不兼容';
    }

    return (
      <Space size="small">
        <Icon icon={icon} size={14} style={{ color }} />
        <Text style={{ color, fontSize: '12px' }}>{text}</Text>
        <Text style={{ color: theme.colorTextSecondary, fontSize: '12px' }}>
          ({Math.round(compatibilityScore * 100)}%)
        </Text>
      </Space>
    );
  }, [compatibilityResult, theme]);

  // 渲染参数信息卡片
  const renderParameterCard = useCallback((
    parameter: NodeParameterSchema,
    title: string,
    borderColor: string
  ) => (
    <Card
      size="small"
      title={title}
      style={{
        marginBottom: '12px',
        borderColor,
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }}
      styles={{ body: { padding: '12px' } }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>{parameter.name}</Text>
          <Tag color="blue" size="small">{parameter.type}</Tag>
        </Space>

        {parameter.description && (
          <Text style={{ fontSize: '12px', color: theme.colorTextSecondary }}>
            {parameter.description}
          </Text>
        )}

        <Space size="small" wrap>
          {parameter.required && (
            <Tag color="red" size="small">必需</Tag>
          )}
          {parameter.defaultValue !== undefined && (
            <Tag color="green" size="small">默认: {String(parameter.defaultValue)}</Tag>
          )}
          {parameter.enumValues && (
            <Tag color="purple" size="small">枚举: {parameter.enumValues.length}项</Tag>
          )}
        </Space>
      </Space>
    </Card>
  ), [theme]);

  // 渲染转换信息
  const renderTransformationInfo = useCallback(() => {
    if (!compatibilityResult?.transformationRequired) return null;

    return (
      <Card
        size="small"
        title={
          <Space>
            <Icon icon={Zap} size={14} style={{ color: theme.colorWarning }} />
            转换信息
          </Space>
        }
        style={{
          marginBottom: '12px',
          borderColor: theme.colorWarning,
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }}
        styles={{ body: { padding: '12px' } }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {compatibilityResult.transformationExpression && (
            <div>
              <Text style={{ fontSize: '12px', color: theme.colorTextSecondary }}>
                转换表达式:
              </Text>
              <div style={{
                backgroundColor: theme.colorFillQuaternary,
                padding: '8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                marginTop: '4px'
              }}>
                {compatibilityResult.transformationExpression}
              </div>
            </div>
          )}

          {compatibilityResult.warnings.length > 0 && (
            <div>
              <Text style={{ fontSize: '12px', color: theme.colorWarning }}>
                警告:
              </Text>
              {compatibilityResult.warnings.map((warning, index) => (
                <div key={index} style={{ fontSize: '12px', color: theme.colorTextSecondary }}>
                  • {warning}
                </div>
              ))}
            </div>
          )}

          {compatibilityResult.recommendations.length > 0 && (
            <div>
              <Text style={{ fontSize: '12px', color: theme.colorPrimary }}>
                建议:
              </Text>
              {compatibilityResult.recommendations.map((recommendation, index) => (
                <div key={index} style={{ fontSize: '12px', color: theme.colorTextSecondary }}>
                  • {recommendation}
                </div>
              ))}
            </div>
          )}
        </Space>
      </Card>
    );
  }, [compatibilityResult, theme]);

  // 渲染映射信息
  const renderMappingInfo = useCallback(() => {
    if (!parameterMapping) return null;

    return (
      <Card
        size="small"
        title={
          <Space>
            <Icon icon={Info} size={14} style={{ color: theme.colorPrimary }} />
            映射信息
          </Space>
        }
        style={{
          marginBottom: '12px',
          borderColor: theme.colorPrimary,
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }}
        styles={{ body: { padding: '12px' } }}
      >
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space size="small">
            <Text style={{ fontSize: '12px', color: theme.colorTextSecondary }}>模式:</Text>
            <Tag color={parameterMapping.bindingMode === 'auto' ? 'green' : 'blue'} size="small">
              {parameterMapping.bindingMode === 'auto' ? '自动' : '手动'}
            </Tag>
          </Space>

          {parameterMapping.sourceParameterName && (
            <Space size="small">
              <Text style={{ fontSize: '12px', color: theme.colorTextSecondary }}>源参数:</Text>
              <Text style={{ fontSize: '12px' }}>{parameterMapping.sourceParameterName}</Text>
            </Space>
          )}

          {parameterMapping.lastUpdated && (
            <Space size="small">
              <Text style={{ fontSize: '12px', color: theme.colorTextSecondary }}>更新时间:</Text>
              <Text style={{ fontSize: '12px' }}>
                {new Date(parameterMapping.lastUpdated).toLocaleString()}
              </Text>
            </Space>
          )}
        </Space>
      </Card>
    );
  }, [parameterMapping, theme]);

  // 渲染预览内容
  const renderPreviewContent = useCallback(() => {
    if (loading) {
      return (
        <Card style={{ width: '320px' }}>
          <Text>加载中...</Text>
        </Card>
      );
    }

    if (!sourceParameter && !targetParameter && !parameterMapping) {
      return (
        <Card style={{ width: '320px' }}>
          <Text>暂无参数信息</Text>
        </Card>
      );
    }

    return (
      <div style={{ width: '380px', maxHeight: '500px', overflow: 'auto' }}>
        {/* 兼容性指示器 */}
        {compatibilityResult && (
          <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: theme.colorFillQuaternary, borderRadius: '6px' }}>
            {getCompatibilityIndicator()}
          </div>
        )}

        {/* 源参数信息 */}
        {sourceParameter && renderParameterCard(
          sourceParameter,
          '源参数',
          theme.colorSuccess
        )}

        {/* 目标参数信息 */}
        {targetParameter && renderParameterCard(
          targetParameter,
          '目标参数',
          theme.colorPrimary
        )}

        {/* 转换信息 */}
        {renderTransformationInfo()}

        {/* 映射信息 */}
        {renderMappingInfo()}
      </div>
    );
  }, [
    loading,
    sourceParameter,
    targetParameter,
    parameterMapping,
    compatibilityResult,
    getCompatibilityIndicator,
    renderParameterCard,
    renderTransformationInfo,
    renderMappingInfo,
    theme
  ]);

  if (!showDetails) {
    return children;
  }

  return (
    <Tooltip
      title={renderPreviewContent()}
      placement="right"
      trigger="hover"
      overlayStyle={{ maxWidth: 'none' }}
      overlayInnerStyle={{ padding: '12px' }}
      className={className}
    >
      {children}
    </Tooltip>
  );
});

ParameterPreview.displayName = 'ParameterPreview';

export default ParameterPreview;