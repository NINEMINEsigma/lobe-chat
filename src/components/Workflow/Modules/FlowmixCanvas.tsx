'use client';

import React, { memo, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowProvider,
  MarkerType,
  BackgroundVariant
} from '@xyflow/react';
import { createStyles } from 'antd-style';

import { LobeFlowData, LobeFlowNode } from '@/types/agent/flowmix';

import '@xyflow/react/dist/style.css';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    height: 100%;
    width: 100%;
    background: ${token.colorBgContainer};
  `,
  reactflow: css`
    background: ${token.colorBgContainer};

    .react-flow__node {
      background: ${token.colorBgElevated};
      border: 1px solid ${token.colorBorder};
      border-radius: ${token.borderRadius}px;
      color: ${token.colorText};
      font-size: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &.selected {
        border-color: ${token.colorPrimary};
        box-shadow: 0 0 0 2px ${token.colorPrimary}20;
      }
    }

    .react-flow__edge {
      .react-flow__edge-path {
        stroke: ${token.colorBorder};
        stroke-width: 2;
      }

      &.selected .react-flow__edge-path {
        stroke: ${token.colorPrimary};
        stroke-width: 3;
      }
    }

    .react-flow__handle {
      background: ${token.colorPrimary};
      border: 2px solid ${token.colorBgContainer};
      width: 8px;
      height: 8px;
    }
  `
}));

// 默认节点类型
const defaultNodeTypes = {
  input: ({ data }: { data: any }) => (
    <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '8px' }}>
      <strong>{data.labelKey || '输入节点'}</strong>
      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
        {data.descriptionKey || '开始节点'}
      </div>
    </div>
  ),
  output: ({ data }: { data: any }) => (
    <div style={{ padding: '10px', background: '#e6f7ff', borderRadius: '8px' }}>
      <strong>{data.labelKey || '输出节点'}</strong>
      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
        {data.descriptionKey || '结束节点'}
      </div>
    </div>
  ),
  agent: ({ data }: { data: any }) => (
    <div style={{ padding: '10px', background: '#fff', borderRadius: '8px' }}>
      <strong>{data.labelKey || 'AI助手'}</strong>
      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
        {data.descriptionKey || 'AI处理节点'}
      </div>
    </div>
  ),
  chat: ({ data }: { data: any }) => (
    <div style={{ padding: '10px', background: '#fff', borderRadius: '8px' }}>
      <strong>{data.labelKey || '对话节点'}</strong>
      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
        {data.descriptionKey || '对话处理'}
      </div>
    </div>
  ),
  function: ({ data }: { data: any }) => (
    <div style={{ padding: '10px', background: '#fff', borderRadius: '8px' }}>
      <strong>{data.labelKey || '功能节点'}</strong>
      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
        {data.descriptionKey || '功能处理'}
      </div>
    </div>
  ),
  llm: ({ data }: { data: any }) => (
    <div style={{ padding: '10px', background: '#fff', borderRadius: '8px' }}>
      <strong>{data.labelKey || 'LLM节点'}</strong>
      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
        {data.descriptionKey || 'LLM处理'}
      </div>
    </div>
  ),
  settings: ({ data }: { data: any }) => (
    <div style={{ padding: '10px', background: '#fff', borderRadius: '8px' }}>
      <strong>{data.labelKey || '设置节点'}</strong>
      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
        {data.descriptionKey || '配置设置'}
      </div>
    </div>
  )
};

interface FlowmixCanvasProps {
  flowData: LobeFlowData;
  onNodesChange: (nodes: LobeFlowNode[]) => void;
  onEdgesChange?: (edges: any[]) => void;
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
  className?: string;
}

const FlowmixCanvasInner: React.FC<FlowmixCanvasProps> = ({
  flowData,
  onNodesChange,
  onEdgesChange,
  onViewportChange,
  className
}) => {
  const { styles } = useStyles();

  // 转换节点数据格式
  const reactFlowNodes = useMemo(() => {
    return flowData.nodes.map((node: LobeFlowNode) => ({
      id: node.id,
      type: node.type,
      position: node.position || { x: 0, y: 0 },
      data: {
        labelKey: node.data?.labelKey || `workflow.nodes.${node.type}`,
        descriptionKey: node.data?.descriptionKey || `workflow.nodes.${node.type}Desc`,
        ...node.data
      }
    }));
  }, [flowData.nodes]);

  // 转换边数据格式
  const reactFlowEdges = useMemo(() => {
    return (flowData.edges || []).map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type || 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20
      }
    }));
  }, [flowData.edges]);

  const [nodes, setNodes, onNodesStateChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesStateChange] = useEdgesState(reactFlowEdges);

  // 处理连接
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        id: `edge-${params.source}-${params.target}`,
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20
        }
      };

      setEdges((eds) => addEdge(newEdge, eds));

      // 通知父组件边的变化
      if (onEdgesChange) {
        onEdgesChange([...edges, newEdge]);
      }
    },
    [edges, onEdgesChange, setEdges]
  );

  // 处理节点变化
  const handleNodesChange = useCallback(
    (changes: any[]) => {
      onNodesStateChange(changes);

      // 转换回LobeFlowNode格式并通知父组件
      const updatedNodes = nodes.map((node): LobeFlowNode => ({
        id: node.id,
        type: node.type as LobeFlowNode['type'],
        position: node.position,
        data: {
          labelKey: node.data?.labelKey || `workflow.nodes.${node.type}`,
          descriptionKey: node.data?.descriptionKey || `workflow.nodes.${node.type}Desc`,
          executionCount: node.data?.executionCount || 0,
          ...node.data
        }
      }));

      onNodesChange(updatedNodes);
    },
    [nodes, onNodesChange, onNodesStateChange]
  );

  // 处理边变化
  const handleEdgesChange = useCallback(
    (changes: any[]) => {
      onEdgesStateChange(changes);

      if (onEdgesChange) {
        onEdgesChange(edges);
      }
    },
    [edges, onEdgesChange, onEdgesStateChange]
  );

  // 处理视图变化
  const handleViewportChange = useCallback(
    (_: any, viewport: { x: number; y: number; zoom: number }) => {
      onViewportChange?.(viewport);
    },
    [onViewportChange]
  );

  // 处理拖拽放置
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = (event.target as HTMLElement).getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      };

      const newNode: LobeFlowNode = {
        id: `${type}-${Date.now()}`,
        type: type as LobeFlowNode['type'],
        position,
        data: {
          labelKey: `workflow.nodes.${type}`,
          descriptionKey: `workflow.nodes.${type}Desc`,
          executionCount: 0
        }
      };

      setNodes((nds) => [...nds, newNode as any]);

      // 通知父组件节点变化
      const updatedNodes = [...nodes.map((n): LobeFlowNode => ({
        id: n.id,
        type: n.type as LobeFlowNode['type'],
        position: n.position,
        data: {
          labelKey: n.data?.labelKey || `workflow.nodes.${n.type}`,
          descriptionKey: n.data?.descriptionKey || `workflow.nodes.${n.type}Desc`,
          executionCount: n.data?.executionCount || 0,
          ...n.data
        }
      })), newNode];
      onNodesChange(updatedNodes);
    },
    [nodes, onNodesChange, setNodes]
  );

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <ReactFlow
        className={styles.reactflow}
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onMoveEnd={handleViewportChange}
        nodeTypes={defaultNodeTypes}
        defaultViewport={flowData.viewport || { x: 0, y: 0, zoom: 1 }}
        fitView
        attributionPosition="bottom-left"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
        />
        <Controls />
        <MiniMap
          nodeStrokeColor="#666"
          nodeColor="#fff"
          nodeBorderRadius={8}
          style={{
            background: '#f8f8f8',
            border: '1px solid #ddd'
          }}
        />
      </ReactFlow>
    </div>
  );
};

// 使用ReactFlowProvider包装组件
const FlowmixCanvas: React.FC<FlowmixCanvasProps> = (props) => (
  <ReactFlowProvider>
    <FlowmixCanvasInner {...props} />
  </ReactFlowProvider>
);

export default memo(FlowmixCanvas);