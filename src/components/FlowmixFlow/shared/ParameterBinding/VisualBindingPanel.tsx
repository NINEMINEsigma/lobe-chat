import { memo, useCallback, useEffect, useState } from 'react';
import { Card, Space, Button, Divider, Empty, Tooltip, Badge, Alert, Select, Tag } from 'antd';
import { Node, Edge } from '@xyflow/react';
import { useTheme } from 'antd-style';
import { Icon } from '@lobehub/ui';
import {
  Link,
  Unlink,
  Zap,
  Eye,
  Settings,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Plus,
  Info
} from 'lucide-react';

import {
  ParameterMapping,
  VisualParameterBinding,
  NodeParameterSchema
} from '@/utils/workflow/multiInputCollector';
import { parameterDiscoveryService } from '@/services/workflow/parameterDiscoveryService';
import ParameterSelector from './ParameterSelector';

interface VisualBindingPanelProps {
  /** 当前节点 */
  currentNode: Node;
  /** 所有节点列表 */
  allNodes: Node[];
  /** 所有连线列表 */
  allEdges: Edge[];
  /** 当前参数映射配置 */
  parameterMappings: ParameterMapping[];
  /** 参数映射变化回调 */
  onParameterMappingsChange: (mappings: ParameterMapping[]) => void;
  /** 是否只读模式 */
  readonly?: boolean;
  /** 面板标题 */
  title?: string;
}

/**
 * 可视化参数绑定面板
 * 复用现有的Panel组件架构，提供拖拽式参数绑定功能
 */
const VisualBindingPanel = memo<VisualBindingPanelProps>(({
  currentNode,
  allNodes,
  allEdges,
  parameterMappings,
  onParameterMappingsChange,
  readonly = false,
  title = '参数绑定'
}) => {
  const theme = useTheme();

  const [currentNodeParameters, setCurrentNodeParameters] = useState<NodeParameterSchema[]>([]);
  const [bindingRecommendations, setBindingRecommendations] = useState<VisualParameterBinding[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // 手动绑定状态
  const [selectedTargetParameterName, setSelectedTargetParameterName] = useState<string>('');
  const [selectedSourceNodeId, setSelectedSourceNodeId] = useState<string>('');
  const [selectedSourceParameterName, setSelectedSourceParameterName] = useState<string>('');

  // 加载当前节点的输入参数信息
  const loadCurrentNodeInputParameters = useCallback(async () => {
    setLoading(true);
    try {
      const inputParameters = await parameterDiscoveryService.discoverInputParameters(currentNode);
      setCurrentNodeParameters(inputParameters);
    } catch (error) {
      console.error('[VisualBindingPanel] 加载节点输入参数失败:', error);
    } finally {
      setLoading(false);
    }
  }, [currentNode]);

  // 生成绑定推荐
  const generateRecommendations = useCallback(async () => {
    const sourceNodes = allNodes.filter(node =>
      node.id !== currentNode.id &&
      allEdges.some(edge => edge.source === node.id && edge.target === currentNode.id)
    );

    const recommendations: VisualParameterBinding[] = [];

    for (const sourceNode of sourceNodes) {
      const nodeRecommendations = await parameterDiscoveryService.generateBindingRecommendations(
        sourceNode,
        currentNode
      );
      recommendations.push(...nodeRecommendations);
    }

    setBindingRecommendations(recommendations.slice(0, 10)); // 限制推荐数量
  }, [allNodes, allEdges, currentNode]);

  // 初始化数据
  useEffect(() => {
    console.log('[VisualBindingPanel] 初始化数据:', {
      currentNodeId: currentNode.id,
      currentNodeType: currentNode.data?.nodeType || currentNode.type,
      hasParameterMappings: !!parameterMappings,
      parameterMappingsCount: parameterMappings?.length || 0,
      parameterMappings: parameterMappings,
      allNodesCount: allNodes.length,
      allEdgesCount: allEdges.length
    });

    loadCurrentNodeInputParameters();
    generateRecommendations();
  }, [loadCurrentNodeInputParameters, generateRecommendations, currentNode.id, parameterMappings]);

  // 获取上游节点
  const getUpstreamNodes = useCallback(() => {
    // ✅ 防御性检查：确保必要的数据存在
    if (!Array.isArray(allNodes) || !Array.isArray(allEdges) || !currentNode?.id) {
      console.warn('VisualBindingPanel: Missing required data for getUpstreamNodes', {
        allNodesValid: Array.isArray(allNodes),
        allEdgesValid: Array.isArray(allEdges),
        currentNodeId: currentNode?.id
      });
      return [];
    }

    try {
      const upstreamNodes = allNodes.filter(node => {
        // ✅ 确保节点数据完整性
        if (!node?.id || node.id === currentNode.id) {
          return false;
        }

        // ✅ 检查是否有连接到当前节点的边
        const hasConnection = allEdges.some(edge => {
          if (!edge?.source || !edge?.target) {
            return false;
          }
          return edge.source === node.id && edge.target === currentNode.id;
        });

        return hasConnection;
      });

      console.log('VisualBindingPanel: Found upstream nodes', {
        currentNodeId: currentNode.id,
        upstreamCount: upstreamNodes.length,
        upstreamNodeIds: upstreamNodes.map(n => n.id)
      });

      return upstreamNodes;
    } catch (error) {
      console.error('VisualBindingPanel: Error in getUpstreamNodes', error);
      return [];
    }
  }, [allNodes, allEdges, currentNode]);

  // 添加参数映射
  const handleAddParameterMapping = useCallback((
    sourceNodeId: string,
    sourceParameterName: string,
    targetParameterName: string
  ) => {
    const newMapping: ParameterMapping = {
      parameterName: targetParameterName,
      sourceNodeId,
      sourceParameterName,
      required: true,
      bindingMode: 'manual',
      lastUpdated: Date.now()
    };

    const updatedMappings = [...parameterMappings, newMapping];

    console.log('[VisualBindingPanel] 添加参数映射:', {
      currentNodeId: currentNode.id,
      newMapping,
      previousCount: parameterMappings.length,
      newCount: updatedMappings.length,
      updatedMappings
    });

    onParameterMappingsChange(updatedMappings);
  }, [parameterMappings, onParameterMappingsChange, currentNode.id]);

  // 删除参数映射
  const handleRemoveParameterMapping = useCallback((index: number) => {
    console.log('[VisualBindingPanel] 删除参数映射:', {
      currentNodeId: currentNode.id,
      removeIndex: index,
      beforeCount: parameterMappings.length,
      mappingToRemove: parameterMappings[index]
    });

    const updatedMappings = parameterMappings.filter((_, i) => i !== index);

    console.log('[VisualBindingPanel] 删除后参数映射:', {
      afterCount: updatedMappings.length,
      updatedMappings
    });

    onParameterMappingsChange(updatedMappings);
  }, [parameterMappings, onParameterMappingsChange, currentNode.id]);

  // 应用推荐绑定
  const handleApplyRecommendation = useCallback((recommendation: VisualParameterBinding) => {
    const newMapping: ParameterMapping = {
      parameterName: recommendation.targetConnectionPoint.parameterName,
      sourceNodeId: recommendation.sourceConnectionPoint.nodeId,
      sourceParameterName: recommendation.sourceConnectionPoint.parameterName,
      required: true,
      bindingMode: 'auto',
      visualBinding: recommendation,
      lastUpdated: Date.now()
    };

    const updatedMappings = [...parameterMappings, newMapping];
    onParameterMappingsChange(updatedMappings);
  }, [parameterMappings, onParameterMappingsChange]);

  // 渲染参数映射项
  const renderParameterMappingItem = useCallback((mapping: ParameterMapping, index: number) => {
    const sourceNode = allNodes.find(n => n.id === mapping.sourceNodeId);
    const targetParameter = currentNodeParameters.find(p => p.name === mapping.parameterName);

    return (
      <Card
        key={index}
        size="small"
        style={{
          marginBottom: '12px',
          borderColor: theme.colorBorder,
          backgroundColor: theme.colorFillQuaternary,
          borderLeft: `4px solid ${theme.colorSuccess}`
        }}
        styles={{ body: { padding: '12px' } }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space direction="vertical" size="small" style={{ flex: 1 }}>
            <Space size="small" style={{ alignItems: 'center' }}>
              <Badge
                status="success"
                dot
                style={{ marginRight: '4px' }}
              />
              <Icon
                icon={mapping.bindingMode === 'auto' ? Zap : Settings}
                size={14}
                style={{ color: mapping.bindingMode === 'auto' ? theme.colorSuccess : theme.colorPrimary }}
              />
              <span style={{ fontWeight: 500 }}>
                {sourceNode?.data?.title || mapping.sourceNodeId}
              </span>
              <Icon icon={ArrowRight} size={12} style={{ color: theme.colorTextSecondary }} />
              <span style={{ color: theme.colorPrimary, fontWeight: 500 }}>
                {mapping.parameterName}
              </span>
            </Space>

            <Space size="small" style={{ fontSize: '12px', color: theme.colorTextSecondary }}>
              <Space size="small">
                <Icon icon={CheckCircle} size={12} style={{ color: theme.colorSuccess }} />
                <span>源参数: {mapping.sourceParameterName}</span>
              </Space>
              {targetParameter && (
                <>
                  <Divider type="vertical" />
                  <span>类型: {targetParameter.type}</span>
                </>
              )}
              {mapping.visualBinding && (
                <>
                  <Divider type="vertical" />
                  <Badge
                    status={mapping.visualBinding.isCompatible ? 'success' : 'warning'}
                    text={mapping.visualBinding.isCompatible ? '兼容' : '需转换'}
                  />
                </>
              )}
            </Space>
          </Space>

          {!readonly && (
            <Button
              type="text"
              size="small"
              icon={<Icon icon={Unlink} size={14} />}
              onClick={() => handleRemoveParameterMapping(index)}
              style={{ color: theme.colorTextSecondary }}
            />
          )}
        </Space>
      </Card>
    );
  }, [allNodes, currentNodeParameters, theme, readonly, handleRemoveParameterMapping]);

  // 渲染推荐绑定项
  const renderRecommendationItem = useCallback((recommendation: VisualParameterBinding, index: number) => {
    const sourceNode = allNodes.find(n => n.id === recommendation.sourceConnectionPoint.nodeId);
    const confidenceColor = recommendation.confidence > 0.8 ?
      theme.colorSuccess :
      recommendation.confidence > 0.5 ? theme.colorWarning : theme.colorError;

    return (
      <Card
        key={index}
        size="small"
        style={{
          marginBottom: '8px',
          borderColor: theme.colorBorder,
          cursor: readonly ? 'default' : 'pointer'
        }}
        styles={{ body: { padding: '10px' } }}
        onClick={() => !readonly && handleApplyRecommendation(recommendation)}
        hoverable={!readonly}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space direction="vertical" size="small" style={{ flex: 1 }}>
            <Space size="small">
              <Icon
                icon={recommendation.isCompatible ? CheckCircle : AlertCircle}
                size={14}
                style={{ color: recommendation.isCompatible ? theme.colorSuccess : theme.colorWarning }}
              />
              <span style={{ fontSize: '13px' }}>
                {sourceNode?.data?.title || recommendation.sourceConnectionPoint.nodeId}
                .{recommendation.sourceConnectionPoint.parameterName}
              </span>
              <Icon icon={ArrowRight} size={10} style={{ color: theme.colorTextSecondary }} />
              <span style={{ fontSize: '13px' }}>
                {recommendation.targetConnectionPoint.parameterName}
              </span>
            </Space>
          </Space>

          <Space size="small">
            <Tooltip title={`推荐置信度: ${Math.round(recommendation.confidence * 100)}%`}>
              <div style={{
                width: '40px',
                height: '4px',
                backgroundColor: theme.colorFillSecondary,
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${recommendation.confidence * 100}%`,
                  height: '100%',
                  backgroundColor: confidenceColor,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </Tooltip>
            {!readonly && (
              <Button
                type="primary"
                size="small"
                icon={<Icon icon={Link} size={12} />}
                style={{ fontSize: '12px', height: '24px' }}
              >
                应用
              </Button>
            )}
          </Space>
        </Space>
      </Card>
    );
  }, [allNodes, theme, readonly, handleApplyRecommendation]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 头部 */}
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: `1px solid ${theme.colorBorder}`
      }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Icon icon={Link} size={16} />
            <span style={{ fontSize: '16px', fontWeight: 500 }}>{title}</span>
          </Space>
          <Space>
            <Tooltip title={previewMode ? '退出预览' : '预览模式'}>
              <Button
                type="text"
                size="small"
                icon={<Icon icon={Eye} size={14} />}
                onClick={() => setPreviewMode(!previewMode)}
                style={{
                  color: previewMode ? theme.colorPrimary : theme.colorTextSecondary
                }}
              />
            </Tooltip>
          </Space>
        </Space>
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {/* 当前绑定 */}
          <div>
            <div style={{
              marginBottom: '12px',
              fontSize: '14px',
              fontWeight: 500,
              color: theme.colorText
            }}>
              当前绑定 ({parameterMappings.length})
            </div>

            {parameterMappings.length > 0 ? (
              parameterMappings.map(renderParameterMappingItem)
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无参数绑定"
                style={{ margin: '20px 0' }}
              />
            )}
          </div>

          {/* 智能推荐 */}
          {bindingRecommendations.length > 0 && (
            <>
              <Divider />
              <div>
                <div style={{
                  marginBottom: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: theme.colorText
                }}>
                  <Space>
                    <Icon icon={Zap} size={14} style={{ color: theme.colorWarning }} />
                    智能推荐
                  </Space>
                </div>

                <Alert
                  message="基于类型兼容性和语义相似性生成的绑定推荐"
                  type="info"
                  showIcon
                  style={{ marginBottom: '12px', fontSize: '12px' }}
                />

                {bindingRecommendations.slice(0, 5).map(renderRecommendationItem)}
              </div>
            </>
          )}

          {/* 手动绑定（仅在非只读模式下显示） */}
          {!readonly && (
            <>
              <Divider />
              <div>
                <div style={{
                  marginBottom: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: theme.colorText
                }}>
                  手动绑定
                </div>

                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {/* 目标参数选择 - 优化布局 */}
                  <Card
                    size="small"
                    title={
                      <Space>
                        <Icon icon={Settings} size={14} />
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>选择目标参数</span>
                      </Space>
                    }
                    style={{ backgroundColor: theme.colorFillQuaternary }}
                  >
                    <Select
                      style={{ width: '100%' }}
                      placeholder="选择要绑定的目标参数"
                      value={selectedTargetParameterName}
                      onChange={setSelectedTargetParameterName}
                      showSearch
                      size="middle"
                      optionLabelProp="label"
                      dropdownMatchSelectWidth={true}
                    >
                      {currentNodeParameters.map(param => (
                        <Select.Option key={param.name} value={param.name} label={param.name}>
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
                              <span style={{
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {param.name}
                              </span>
                              {param.description && (
                                <Tooltip title={param.description}>
                                  <Icon icon={Info} size={12} style={{ color: theme.colorTextSecondary }} />
                                </Tooltip>
                              )}
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              flexShrink: 0,
                              marginLeft: '8px'
                            }}>
                              <Tag color="blue">{param.type}</Tag>
                              {param.required && <Tag color="red">必需</Tag>}
                            </div>
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                  </Card>

                  {/* 源节点和参数选择 - 优化布局 */}
                  {selectedTargetParameterName && (
                    <Card
                      size="small"
                      title={
                        <Space>
                          <Icon icon={Link} size={14} />
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>选择源参数</span>
                          <Icon icon={ArrowRight} size={12} style={{ color: theme.colorTextSecondary }} />
                          <Tag color="blue">{selectedTargetParameterName}</Tag>
                        </Space>
                      }
                      style={{ backgroundColor: theme.colorFillQuaternary }}
                    >
                      <ParameterSelector
                        upstreamNodes={getUpstreamNodes() || []}
                        targetInputParameter={currentNodeParameters.find(p => p.name === selectedTargetParameterName)}
                        showCompatibility={true}
                        selectedSourceNodeId={selectedSourceNodeId}
                        selectedSourceParameterName={selectedSourceParameterName}
                        onChange={(sourceNodeId, parameterName, parameter) => {
                          setSelectedSourceNodeId(sourceNodeId);
                          setSelectedSourceParameterName(parameterName);
                        }}
                        placeholder="选择源参数"
                      />
                    </Card>
                  )}

                  {/* 绑定预览和添加按钮 */}
                  {selectedTargetParameterName && selectedSourceNodeId && selectedSourceParameterName && (
                    <Card
                      size="small"
                      style={{
                        borderColor: theme.colorPrimary,
                        backgroundColor: theme.colorBgElevated
                      }}
                    >
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space direction="vertical" size="small">
                          <div style={{ fontSize: '13px', fontWeight: 500, color: theme.colorText }}>
                            绑定预览
                          </div>
                          <Space size="small">
                            <span style={{ fontSize: '12px' }}>
                              {allNodes.find(n => n.id === selectedSourceNodeId)?.data?.label || selectedSourceNodeId}
                            </span>
                            <Icon icon={ArrowRight} size={10} />
                            <span style={{ fontSize: '12px', color: theme.colorPrimary }}>
                              {selectedSourceParameterName}
                            </span>
                            <Icon icon={ArrowRight} size={10} />
                            <span style={{ fontSize: '12px' }}>
                              {selectedTargetParameterName}
                            </span>
                          </Space>
                        </Space>
                        <Button
                          type="primary"
                          size="small"
                          icon={<Icon icon={Plus} size={12} />}
                          onClick={() => {
                            // 添加参数绑定
                            const newMapping: ParameterMapping = {
                              sourceNodeId: selectedSourceNodeId!,
                              sourceParameterName: selectedSourceParameterName!,
                              parameterName: selectedTargetParameterName!,
                              bindingMode: 'manual',
                              required: true,
                              lastUpdated: Date.now()
                            };

                            const updatedMappings = [...parameterMappings, newMapping];

                            console.log('[VisualBindingPanel] 手动添加参数绑定:', {
                              currentNodeId: currentNode.id,
                              selectedSource: {
                                nodeId: selectedSourceNodeId,
                                parameterName: selectedSourceParameterName
                              },
                              selectedTarget: selectedTargetParameterName,
                              newMapping,
                              previousCount: parameterMappings.length,
                              newCount: updatedMappings.length
                            });

                            onParameterMappingsChange(updatedMappings);

                            // 清空选择
                            setSelectedTargetParameterName('');
                            setSelectedSourceNodeId('');
                            setSelectedSourceParameterName('');
                          }}
                        >
                          添加绑定
                        </Button>
                      </Space>
                    </Card>
                  )}
                </Space>
              </div>
            </>
          )}
        </Space>
      </div>
    </div>
  );
});

VisualBindingPanel.displayName = 'VisualBindingPanel';

export default VisualBindingPanel;