import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { createStyles, useTheme } from 'antd-style';
import { memo, useCallback, useRef } from 'react';
import { LobeAgentWorkflowNode } from '@/types/agent/workflow';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    flex: 1;
    height: 100%;
  `,
  flow: css`
    background: ${isDarkMode ? '#1a1a1a' : token.colorBgLayout};
    transition: background-color 0.3s ease;
  `,
  node: css`
    background: ${isDarkMode ? '#2a2a2a' : token.colorBgElevated};
    border: 1px solid ${isDarkMode ? '#404040' : token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    padding: ${token.padding}px;
    color: ${isDarkMode ? '#ffffff' : token.colorText};
    transition: all 0.3s ease;

    &:hover {
      border-color: ${isDarkMode ? '#1890ff' : token.colorPrimary};
      background: ${isDarkMode ? '#333333' : token.colorBgElevated};
      transform: translateY(-2px);
      box-shadow: ${isDarkMode
        ? '0 4px 12px rgba(24, 144, 255, 0.3)'
        : token.boxShadow};
    }

    &.selected {
      border-color: ${isDarkMode ? '#1890ff' : token.colorPrimary};
      box-shadow: ${isDarkMode
        ? '0 0 0 2px rgba(24, 144, 255, 0.2)'
        : token.boxShadow};
      background: ${isDarkMode ? '#333333' : token.colorBgElevated};
    }
  `,
}));

interface WorkflowCanvasProps {
  nodes: LobeAgentWorkflowNode[];
  edges: Edge[];
  onNodesChange: (nodes: Node[], edges: Edge[]) => void;
}

const WorkflowCanvas = memo<WorkflowCanvasProps>(({ nodes, edges, onNodesChange }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { styles, theme } = useStyles();
  const { isDarkMode } = useTheme();

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      onNodesChange(nodes, newEdges);
    },
    [edges, nodes, onNodesChange]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode: LobeAgentWorkflowNode = {
        id: `node_${nodes.length + 1}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      onNodesChange([...nodes, newNode], edges);
    },
    [nodes, edges, onNodesChange]
  );

  return (
    <div className={styles.container} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        className={styles.flow}
      >
        <Background color={isDarkMode ? '#404040' : theme.colorTextQuaternary} />
        <Controls />
      </ReactFlow>
    </div>
  );
});

const WrappedWorkflowCanvas = memo<WorkflowCanvasProps>((props) => (
  <ReactFlowProvider>
    <WorkflowCanvas {...props} />
  </ReactFlowProvider>
));

export default WrappedWorkflowCanvas;