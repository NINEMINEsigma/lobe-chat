import { memo, useCallback, useEffect, useState, useMemo } from 'react';
import { Select, Space, Tag, Tooltip, theme } from 'antd';
import { Node } from '@xyflow/react';
import { Icon } from '@lobehub/ui';
import { ArrowRight, Info, Zap } from 'lucide-react';
import { NodeParameterSchema } from '@/utils/workflow/multiInputCollector';
import { parameterDiscoveryService } from '@/services/workflow/parameterDiscoveryService';

interface ParameterSelectorProps {
  /** 可选择的上游节点列表 */
  upstreamNodes: Node[];
  /** 当前选择的源节点ID */
  selectedSourceNodeId?: string;
  /** 当前选择的源参数名称 */
  selectedSourceParameterName?: string;
  /** 目标输入参数信息（用于兼容性检查） */
  targetInputParameter?: NodeParameterSchema;
  /** 目标参数（兼容性用途） */
  targetParameter?: NodeParameterSchema;
  /** 是否显示兼容性指示器 */
  showCompatibility?: boolean;
  /** 选择变化回调 - 选择上游节点的输出参数 */
  onChange?: (sourceNodeId: string, outputParameterName: string, outputParameter: NodeParameterSchema) => void;
  /** 组件样式类名 */
  className?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 占位符文本 */
  placeholder?: string;
}

/**
 * 参数选择器组件
 * 复用现有的Select组件样式，提供级联的节点和参数选择功能
 */
const ParameterSelector: React.FC<ParameterSelectorProps> = memo(({
  upstreamNodes = [],
  selectedSourceNodeId,
  selectedSourceParameterName,
  targetInputParameter,
  targetParameter,
  showCompatibility = false,
  onChange,
  className,
  disabled = false,
  placeholder = '选择参数'
}) => {
  const { token } = theme.useToken();
  const [availableParameters, setAvailableParameters] = useState<NodeParameterSchema[]>([]);
  const [loading, setLoading] = useState(false);

  const safeUpstreamNodes = useMemo(() => {
    if (!Array.isArray(upstreamNodes)) {
      console.warn('ParameterSelector: upstreamNodes is not an array, using empty array');
      return [];
    }
    return upstreamNodes;
  }, [upstreamNodes]);

  const loadNodeParameters = useCallback(async (nodeId: string) => {
    try {
      setLoading(true);
      const node = safeUpstreamNodes.find(n => n.id === nodeId);
      if (!node) {
        console.warn(`ParameterSelector: Node ${nodeId} not found in upstreamNodes`);
        setAvailableParameters([]);
        return;
      }

      const parameters = await parameterDiscoveryService.discoverOutputParameters(node);
      setAvailableParameters(parameters);
    } catch (error) {
      console.error('加载节点参数失败:', error);
      setAvailableParameters([]);
    } finally {
      setLoading(false);
    }
  }, [safeUpstreamNodes]);

  useEffect(() => {
    if (selectedSourceNodeId) {
      loadNodeParameters(selectedSourceNodeId);
    } else {
      setAvailableParameters([]);
    }
  }, [selectedSourceNodeId, loadNodeParameters]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    loadNodeParameters(nodeId);
    if (onChange) {
      const defaultParameter: NodeParameterSchema = {
        name: '',
        type: 'string',
        required: false,
        description: ''
      };
      onChange(nodeId, '', defaultParameter);
    }
  }, [loadNodeParameters, onChange]);

  const handleParameterSelect = useCallback((parameterName: string) => {
    const parameter = availableParameters.find(p => p.name === parameterName);
    if (parameter && selectedSourceNodeId && onChange) {
      onChange(selectedSourceNodeId, parameterName, parameter);
    }
  }, [availableParameters, selectedSourceNodeId, onChange]);

  const getParameterTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'string': return '📝';
      case 'number': return '🔢';
      case 'boolean': return '✅';
      case 'object': return '📋';
      default: return '📄';
    }
  }, []);

  const checkParameterCompatibility = useCallback((parameter: NodeParameterSchema) => {
    if (!targetInputParameter || !showCompatibility) return null;

    const isCompatible = parameterDiscoveryService.validateParameterCompatibility(
      parameter,
      targetInputParameter
    );

    return isCompatible;
  }, [targetInputParameter, showCompatibility]);

  const renderParameterOption = useCallback((parameter: NodeParameterSchema) => {
    const isCompatible = checkParameterCompatibility(parameter);

    return (
      <Select.Option
        key={parameter.name}
        value={parameter.name}
        disabled={showCompatibility && isCompatible === false}
        label={parameter.name}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: '4px'
        }}>
          {/* 主要信息行 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            minHeight: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: 1,
              minWidth: 0
            }}>
              <span style={{ fontSize: '14px', flexShrink: 0 }}>
                {getParameterTypeIcon(parameter.type)}
              </span>
              <span style={{
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {parameter.name}
              </span>
              {parameter.required && (
                <Tag color="red">必需</Tag>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
              marginLeft: '8px'
            }}>
              {parameter.type && (
                <Tag color="blue">{parameter.type}</Tag>
              )}
              {showCompatibility && isCompatible !== null && (
                <Tooltip title={isCompatible ? '类型兼容' : '类型不兼容'}>
                  <Icon
                    icon={isCompatible ? Zap : Info}
                    size={12}
                    style={{
                      color: isCompatible ? token.colorSuccess : token.colorWarning
                    }}
                  />
                </Tooltip>
              )}
            </div>
          </div>

          {/* 描述信息行 */}
          {parameter.description && (
            <div style={{
              fontSize: '12px',
              color: token.colorTextSecondary,
              lineHeight: '1.4',
              paddingLeft: '20px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}>
              {parameter.description}
            </div>
          )}
        </div>
      </Select.Option>
    );
  }, [checkParameterCompatibility, getParameterTypeIcon, showCompatibility, token]);

  const renderNodeOption = useCallback((node: Node) => {
    const nodeType = node.data?.nodeType || node.type || 'unknown';
    const nodeTitle = node.data?.label || node.data?.title || node.id;
    const nodeDescription = node.data?.description || '';

    return (
      <Select.Option key={node.id} value={node.id} label={String(nodeTitle)}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: '6px'
        }}>
          {/* 主标题行 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
          }}>
            <span style={{
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0
            }}>
              {String(nodeTitle)}
            </span>
            <Tag color="geekblue" style={{ marginLeft: '8px', flexShrink: 0 }}>
              {nodeType}
            </Tag>
          </div>

          {/* 描述信息 */}
          {nodeDescription && (
            <div style={{
              fontSize: '12px',
              color: token.colorTextSecondary,
              lineHeight: '1.4',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {String(nodeDescription)}
            </div>
          )}

          {/* 节点ID */}
          <div style={{
            fontSize: '11px',
            color: token.colorTextTertiary,
            fontFamily: 'monospace'
          }}>
            ID: {node.id}
          </div>
        </div>
      </Select.Option>
    );
  }, [token]);

  return (
    <div className={className}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <div style={{
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: token.colorText
          }}>
            源节点
          </div>
          <Select
            style={{ width: '100%' }}
            placeholder="选择源节点"
            value={selectedSourceNodeId}
            onChange={handleNodeSelect}
            disabled={disabled}
            showSearch
            optionLabelProp="label"
            dropdownMatchSelectWidth={true}
            filterOption={(input, option) => {
              const node = safeUpstreamNodes.find((n: Node) => n.id === option?.value);
              const title = String(node?.data?.title || node?.data?.label || node?.id || '');
              return title.toLowerCase().includes(input.toLowerCase());
            }}
          >
            {safeUpstreamNodes.map(renderNodeOption)}
          </Select>

          {safeUpstreamNodes.length === 0 && (
            <div style={{
              marginTop: '8px',
              padding: '8px',
              backgroundColor: token.colorInfoBg,
              borderRadius: '4px',
              fontSize: '12px',
              color: token.colorInfoText
            }}>
              <Icon icon={Info} size={12} style={{ marginRight: '4px' }} />
              没有找到上游节点。请确保当前节点已连接到其他节点。
            </div>
          )}
        </div>

        {selectedSourceNodeId && (
          <div>
            <div style={{
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: token.colorText,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>输出参数</span>
              <Icon icon={ArrowRight} size={12} style={{ color: token.colorTextSecondary }} />
              {targetInputParameter && (
                <span style={{ color: token.colorTextSecondary }}>
                  目标: {targetInputParameter.name}
                </span>
              )}
            </div>
            <Select
              style={{ width: '100%' }}
              placeholder={placeholder}
              value={selectedSourceParameterName}
              onChange={handleParameterSelect}
              disabled={disabled || loading}
              loading={loading}
              showSearch
              dropdownMatchSelectWidth={true}
              filterOption={(input, option) => {
                const parameterName = option?.value as string;
                return String(parameterName || '').toLowerCase().includes(input.toLowerCase());
              }}
              optionLabelProp="label"
            >
              {availableParameters.map(renderParameterOption)}
            </Select>

            {showCompatibility && selectedSourceParameterName && targetParameter && (
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                color: token.colorTextSecondary
              }}>
                <Icon icon={Info} size={12} style={{ marginRight: '4px' }} />
                兼容性检查已启用，不兼容的参数将被禁用
              </div>
            )}
          </div>
        )}
      </Space>
    </div>
  );
});

ParameterSelector.displayName = 'ParameterSelector';

export default ParameterSelector;