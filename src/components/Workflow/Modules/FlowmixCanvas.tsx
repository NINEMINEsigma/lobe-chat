'use client';

import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import NodeDetailModal from '@/components/FlowmixFlow/components/NodeDetailModal';

// 临时类型定义
interface LobeFlowData {
  nodes: any[];
  edges: any[];
  viewport?: { x: number; y: number; zoom: number };
}

// 优化的自定义节点组件 - 使用memo包装，移到组件外部
const CustomNode = memo(({ data }: { data: any }) => {
  const nodeType = data.nodeType || 'default';
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  // 根据节点类型定义毛玻璃样式
  const getGlassStyles = (type: string, hovered: boolean, selected: boolean) => {
    const baseStyles = {
      position: 'relative' as const,
      minWidth: '120px',
      minHeight: '60px',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center' as const,
      color: '#1a1a1a',
      fontWeight: '500',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      zIndex: selected ? 10 : 1,
    };

    // 节点类型配色方案
    const typeConfigs = {
      input: {
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        backdropFilter: 'blur(12px) saturate(1.2)',
        boxShadow: hovered
          ? '0 8px 32px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.2)'
          : '0 4px 16px rgba(0, 0, 0, 0.1)',
        gradientOverlay: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.05) 100%)',
      },
      default: {
        backgroundColor: 'rgba(147, 51, 234, 0.12)',
        borderColor: 'rgba(147, 51, 234, 0.25)',
        backdropFilter: 'blur(10px) saturate(1.1)',
        boxShadow: hovered
          ? '0 8px 32px rgba(147, 51, 234, 0.12), 0 0 0 1px rgba(147, 51, 234, 0.2)'
          : '0 4px 16px rgba(0, 0, 0, 0.08)',
        gradientOverlay: 'linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(196, 181, 253, 0.04) 100%)',
      },
      output: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderColor: 'rgba(34, 197, 94, 0.3)',
        backdropFilter: 'blur(8px) saturate(1.3)',
        boxShadow: hovered
          ? '0 8px 32px rgba(34, 197, 94, 0.15), 0 0 0 1px rgba(34, 197, 94, 0.2)'
          : '0 4px 16px rgba(0, 0, 0, 0.1)',
        gradientOverlay: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(134, 239, 172, 0.05) 100%)',
      },
    };

    const config = typeConfigs[type as keyof typeof typeConfigs] || typeConfigs.default;

    return {
      ...baseStyles,
      background: `${config.gradientOverlay}, ${config.backgroundColor}`,
      border: `1px solid ${config.borderColor}`,
      backdropFilter: config.backdropFilter,
      WebkitBackdropFilter: config.backdropFilter, // Safari support
      boxShadow: selected
        ? `${config.boxShadow}, 0 0 0 2px rgba(59, 130, 246, 0.4)`
        : config.boxShadow,
    };
  };

  // Backdrop扩展容器样式（实现Josh W. Comeau的高级技术）
  const backdropExtensionStyles = {
    position: 'absolute' as const,
    inset: '1px', // 避免超出父容器边框
    borderRadius: '11px', // 比父容器小1px以适应边框
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    pointerEvents: 'none' as const,
    zIndex: -1,
    overflow: 'hidden',
  };

  // 毛玻璃边缘效果
  const glassEdgeStyles = {
    position: 'absolute' as const,
    left: '1px',
    right: '1px',
    bottom: '1px',
    height: '1px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '0 0 11px 11px',
    pointerEvents: 'none' as const,
  };

  const handleStyles = {
    background: isHovered ? '#4f46e5' : '#6b7280',
    border: '2px solid rgba(255, 255, 255, 0.8)',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  };

  return (
    <div
      style={getGlassStyles(nodeType, isHovered, isSelected)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsSelected(!isSelected)}
    >
      {/* 扩展的backdrop-filter区域 - 高级毛玻璃技术 */}
      <div style={backdropExtensionStyles} />

      {/* 毛玻璃边缘效果 */}
      <div style={glassEdgeStyles} />

      {/* 输入节点只有输出Handle */}
      {nodeType !== 'input' && (
        <Handle
          type="target"
          position={Position.Left}
          style={handleStyles}
        />
      )}

      {/* 节点内容 */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
      }}>
        {data.label}
      </div>

      {/* 输出节点只有输入Handle */}
      {nodeType !== 'output' && (
        <Handle
          type="source"
          position={Position.Right}
          style={handleStyles}
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，只在真正需要时重新渲染
  return prevProps.data?.label === nextProps.data?.label &&
         prevProps.data?.nodeType === nextProps.data?.nodeType &&
         prevProps.data?.color === nextProps.data?.color;
});

CustomNode.displayName = 'CustomNode';

// 将nodeTypes移到组件外部，避免每次渲染重新创建
const nodeTypes = {
  custom: CustomNode,
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    width: 100%;
    height: 100%;
    position: relative;
    background: linear-gradient(135deg,
      rgba(99, 102, 241, 0.03) 0%,
      rgba(168, 85, 247, 0.02) 25%,
      rgba(34, 197, 94, 0.02) 50%,
      rgba(59, 130, 246, 0.03) 75%,
      rgba(147, 51, 234, 0.02) 100%);
  `,
  controls: css`
    button {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px) saturate(1.2);
      -webkit-backdrop-filter: blur(10px) saturate(1.2);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: ${token.colorText};
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      &:active {
        transform: translateY(0);
      }
    }
  `,
  minimap: css`
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px) saturate(1.1);
    -webkit-backdrop-filter: blur(12px) saturate(1.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    overflow: hidden;

    .react-flow__minimap-mask {
      fill: rgba(255, 255, 255, 0.2);
    }

    .react-flow__minimap-node {
      fill: rgba(59, 130, 246, 0.3);
      stroke: rgba(59, 130, 246, 0.5);
      stroke-width: 2px;
    }
  `
}));

interface FlowmixCanvasProps {
  initialData?: LobeFlowData;
  onChange?: (data: LobeFlowData) => void;
  editable?: boolean;
  skipProvider?: boolean;
}

const FlowmixCanvasInner = memo<FlowmixCanvasProps>(({
  initialData,
  onChange,
  editable = true,
  skipProvider = false
}) => {
  const { styles } = useStyles();
  const { message } = App.useApp();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // 使用简单的状态管理避免类型问题
  const [nodes, setNodes, onNodesChange] = useNodesState([] as any[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as any[]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });

  // 节点详情弹窗状态
  const [nodeDetailModal, setNodeDetailModal] = useState<{
    open: boolean;
    node: any | null;
  }>({
    open: false,
    node: null
  });

  // 创建防抖的onChange函数，使用useRef管理定时器
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const debouncedOnChange = useCallback(
    (data: LobeFlowData) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (onChange) {
          onChange(data);
        }
      }, 300); // 增加到300ms防抖延迟，减少频繁更新
    },
    [onChange]
  );

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 获取当前状态的函数，避免闭包问题
  const getCurrentData = useCallback((): LobeFlowData => ({
    nodes: nodes as any[],
    edges: edges as any[],
    viewport
  }), [nodes, edges, viewport]);

  // 使用ref存储onChange回调，避免依赖变化
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // 初始化数据 - 保持节点的所有属性，特别是measured
  useEffect(() => {
    if (initialData) {
      // 深拷贝数据，确保可变，但保持所有属性包括measured
      const nodesCopy = initialData.nodes ? initialData.nodes.map(node => ({
        ...JSON.parse(JSON.stringify(node)),
        // 确保保持重要的内部属性
        measured: node.measured,
        internals: node.internals
      })) : [];
      const edgesCopy = initialData.edges ? JSON.parse(JSON.stringify(initialData.edges)) : [];

      // 检查是否需要数据迁移
      const { needsDataMigration, initializeWorkflowData } = require('@/utils/workflow/connectionSync');
      const needsMigration = needsDataMigration(nodesCopy);

      if (needsMigration) {
        console.log('检测到历史数据，正在进行连接信息迁移...');
      }

      // 完整的数据初始化处理 - 兼容性处理 + 连接同步
      const { nodes: initializedNodes, edges: initializedEdges } = initializeWorkflowData(nodesCopy, edgesCopy);

      setNodes(initializedNodes);
      setEdges(initializedEdges);

      if (initialData.viewport) {
        setViewport({ ...initialData.viewport });
      }

      // 如果进行了数据迁移，延迟通知上层组件保存（避免循环）
      if (needsMigration && onChangeRef.current) {
        const timeoutId = setTimeout(() => {
          onChangeRef.current?.({
            nodes: initializedNodes,
            edges: initializedEdges,
            viewport: initialData.viewport || { x: 0, y: 0, zoom: 1 }
          });
        }, 200);

        // 清理定时器
        return () => clearTimeout(timeoutId);
      }
    }
  }, [initialData, setNodes, setEdges]);

    // 独立的连接同步effect - 当节点或边发生变化时同步连接信息
  useEffect(() => {
    try {
      if (nodes.length > 0 && edges.length >= 0) {
        // 检查是否有孤立的边（连接到不存在的节点）
        const nodeIds = new Set(nodes.map((node: any) => node.id));
        const validEdges = edges.filter((edge: any) =>
          nodeIds.has(edge.source) && nodeIds.has(edge.target)
        );

        // 如果有无效边，清理它们
        if (validEdges.length !== edges.length) {
          setEdges(validEdges);
          return; // 下次effect会处理连接同步
        }

        const { updateAllNodesConnections } = require('@/utils/workflow/connectionSync');
        const updatedNodes = updateAllNodesConnections(nodes, edges);

        // 检查是否需要更新（避免不必要的重新渲染）
        const needsUpdate = updatedNodes.some((updatedNode: any, index: number) => {
          const currentNode = nodes[index];
          if (!currentNode) return true;

          const currentInputCount = currentNode.data?.inputConnections?.length || 0;
          const updatedInputCount = updatedNode.data?.inputConnections?.length || 0;
          const currentOutputCount = currentNode.data?.outputConnections?.length || 0;
          const updatedOutputCount = updatedNode.data?.outputConnections?.length || 0;

          return currentInputCount !== updatedInputCount || currentOutputCount !== updatedOutputCount;
        });

        if (needsUpdate) {
          setNodes(updatedNodes);
        }
      }
    } catch (error) {
      console.error('连接同步过程中发生错误:', error);
      // 错误时不进行任何状态更新，避免无限循环
    }
  }, [edges, nodes.length]); // 监听edges和节点数量变化

  // 处理连接 - 简化逻辑，连接同步由独立的effect处理
  const onConnect = useCallback(
    (params: any) => {
      if (!editable) return;

      // 添加边
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);

      // 通知变更（连接信息同步由独立的effect处理）
      debouncedOnChange(getCurrentData());
    },
    [editable, setEdges, edges, debouncedOnChange, getCurrentData]
  );

  // 删除节点
  const onDeleteNode = useCallback(
    (nodeId: string) => {
      if (!editable) return;

      setNodes((nds: any[]) => nds.filter((node: any) => node.id !== nodeId));
      setEdges((eds: any[]) => eds.filter((edge: any) => edge.source !== nodeId && edge.target !== nodeId));

      // 通知变更
      debouncedOnChange(getCurrentData());
    },
    [editable, setNodes, setEdges, debouncedOnChange, getCurrentData]
  );

  // 优化节点更改处理 - 确保保持节点的measured属性
  const handleNodesChange = useCallback(
    (changes: any[]) => {
      if (editable) {
        onNodesChange(changes);

        // 延迟通知变更，避免频繁更新
        debouncedOnChange(getCurrentData());
      }
    },
    [editable, onNodesChange, debouncedOnChange, getCurrentData]
  );

  // 优化边更改处理 - 简化逻辑避免嵌套状态更新
  const handleEdgesChange = useCallback(
    (changes: any[]) => {
      if (editable) {
        onEdgesChange(changes);
        // 延迟通知变更，避免频繁更新
        debouncedOnChange(getCurrentData());
      }
    },
    [editable, onEdgesChange, debouncedOnChange, getCurrentData]
  );

  // 处理拖放
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const data = event.dataTransfer.getData('nodeData');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let nodeData;
      try {
        nodeData = JSON.parse(data);
      } catch {
        nodeData = {};
      }

      // 使用统一的节点创建逻辑，确保包含正确的nodeType
      const newNode: any = {
        id: `${type}_${Date.now()}`,
        type: 'custom',
        position,
        data: {
          ...nodeData,
          label: nodeData.label || type,
          nodeType: type, // ✅ 关键修复：添加正确的nodeType属性
        },
      };

      setNodes((nds: any) => [...nds, newNode]);

      // 通知变更
      debouncedOnChange(getCurrentData());

      message.success(`已添加节点: ${nodeData.label || type}`);
    },
    [setNodes, screenToFlowPosition, debouncedOnChange, getCurrentData]
  );

  // 添加节点到画布
  const addNodeToCanvas = useCallback(
    (type: string, position?: { x: number; y: number }) => {
      const nodeTypes = ['start', 'end', 'task', 'condition', 'parallel', 'data'];
      const nodeColors = {
        start: '#4CAF50',
        end: '#F44336',
        task: '#2196F3',
        condition: '#FF9800',
        parallel: '#9C27B0',
        data: '#607D8B'
      };

      const nodeData = {
        id: `${type}-${Date.now()}`,
        type: 'custom',
        position: position || { x: Math.random() * 200, y: Math.random() * 200 },
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          nodeType: type,
          color: nodeColors[type as keyof typeof nodeColors] || '#9E9E9E'
        }
      };

      const newNode = JSON.parse(JSON.stringify(nodeData));
      setNodes((nds: any[]) => [...nds, newNode]);

      // 通知变更
      debouncedOnChange(getCurrentData());

      message.success(`已添加节点: ${nodeData.data.label || type}`);
    },
    [setNodes, debouncedOnChange, getCurrentData]
  );

  // 双击节点事件处理
  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      event.stopPropagation();

      // 打开节点详情弹窗
      setNodeDetailModal({
        open: true,
        node: node
      });
    },
    []
  );

  // 关闭节点详情弹窗
  const handleCloseNodeDetail = useCallback(() => {
    setNodeDetailModal({
      open: false,
      node: null
    });
  }, []);

  // 保存节点配置
  const handleSaveNodeConfig = useCallback(
    (nodeId: string, newData: any) => {
      console.log('[FlowmixCanvas] 接收节点保存请求:', {
        nodeId,
        newDataKeys: Object.keys(newData || {}),
        hasParameterMappings: !!newData?.parameterMappings,
        parameterMappingsCount: newData?.parameterMappings?.length || 0,
        parameterMappings: newData?.parameterMappings,
        fullNewData: newData
      });

      setNodes((nds: any[]) =>
        nds.map((node: any) => {
          if (node.id === nodeId) {
            // 深度合并数据，特别处理parameterMappings
            const updatedData = {
              ...node.data,
              ...newData,
              // 确保parameterMappings被正确保存
              parameterMappings: newData?.parameterMappings || node.data?.parameterMappings || []
            };

            console.log('[FlowmixCanvas] 更新节点数据:', {
              nodeId,
              originalParameterMappings: node.data?.parameterMappings,
              newParameterMappings: newData?.parameterMappings,
              finalParameterMappings: updatedData.parameterMappings,
              updatedData
            });

            return { ...node, data: updatedData };
          }
          return node;
        })
      );

      // 通知变更
      debouncedOnChange(getCurrentData());

      // 显示成功消息
      message.success('节点配置已保存');

      console.log('[FlowmixCanvas] 节点保存完成:', { nodeId });
    },
    [setNodes, debouncedOnChange, getCurrentData, message]
  );

  // 性能监控 - 开发环境下启用
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('FlowmixCanvas 渲染:', {
        nodesCount: nodes.length,
        edgesCount: edges.length,
        timestamp: new Date().toISOString()
      });
    }
  }, [nodes, edges]);

  return (
    <div className={styles.container} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        defaultViewport={viewport}
        fitView
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="rgba(148, 163, 184, 0.3)"
          style={{
            opacity: 0.6,
          }}
        />
        <Controls className={styles.controls} />
        <MiniMap
          className={styles.minimap}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>

      {/* 节点详情弹窗 */}
      <NodeDetailModal
        open={nodeDetailModal.open}
        node={nodeDetailModal.node}
        onClose={handleCloseNodeDetail}
        onSave={handleSaveNodeConfig}
        allNodes={nodes}
        allEdges={edges}
      />
    </div>
  );
});

FlowmixCanvasInner.displayName = 'FlowmixCanvasInner';

// 包装组件以提供ReactFlowProvider
const FlowmixCanvas = memo<FlowmixCanvasProps>((props) => {
  if (props.skipProvider) {
    return <FlowmixCanvasInner {...props} />;
  }

  return (
    <ReactFlowProvider>
      <FlowmixCanvasInner {...props} />
    </ReactFlowProvider>
  );
});

FlowmixCanvas.displayName = 'FlowmixCanvas';

export default FlowmixCanvas;