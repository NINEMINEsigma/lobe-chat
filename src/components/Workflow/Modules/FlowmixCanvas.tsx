'use client';

import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
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
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

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
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // 使用简单的状态管理避免类型问题
  const [nodes, setNodes, onNodesChange] = useNodesState([] as any[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as any[]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });

  // 创建防抖的onChange函数
  const debouncedOnChange = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (data: LobeFlowData) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (onChange) {
            onChange(data);
          }
        }, 150); // 150ms防抖延迟
      };
    })(),
    [onChange]
  );

  // 获取当前状态的函数，避免闭包问题
  const getCurrentData = useCallback((): LobeFlowData => ({
    nodes: nodes as any[],
    edges: edges as any[],
    viewport
  }), [nodes, edges, viewport]);

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

      setNodes(nodesCopy);
      setEdges(edgesCopy);

      if (initialData.viewport) {
        setViewport({ ...initialData.viewport });
      }
    }
  }, [initialData, setNodes, setEdges]);

  // 处理连接
  const onConnect = useCallback(
    (params: any) => {
      if (!editable) return;

      setEdges((eds: any) => addEdge(params, eds));

      // 通知变更
      debouncedOnChange(getCurrentData());
    },
    [editable, setEdges, debouncedOnChange, getCurrentData]
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

  // 优化边更改处理
  const handleEdgesChange = useCallback(
    (changes: any[]) => {
      if (editable) {
        onEdgesChange(changes);

        // 延迟通知变更
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

      const newNode: any = {
        id: `${type}_${Date.now()}`,
        type: 'custom',
        position,
        data: {
          ...nodeData,
          label: nodeData.label || type,
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