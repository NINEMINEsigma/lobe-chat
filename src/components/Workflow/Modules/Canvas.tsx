import { 
  Background, 
  Controls, 
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { createStyles } from 'antd-style';
import { memo, useCallback, useRef } from 'react';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    flex: 1;
    height: 100%;
  `,
  flow: css`
    background: ${token.colorBgLayout};
  `,
  node: css`
    background: ${token.colorBgElevated};
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
    padding: ${token.padding}px;
    color: ${token.colorText};

    &:hover {
      border-color: ${token.colorPrimary};
    }

    &.selected {
      border-color: ${token.colorPrimary};
      box-shadow: ${token.boxShadow};
    }
  `,
}));

let id = 0;
const getId = () => `node_${id++}`;

type CustomNode = Node<{ label: string }>;
type CustomEdge = Edge;

const WorkflowCanvas = memo(() => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([]);
  const { screenToFlowPosition } = useReactFlow();
  const { styles, theme } = useStyles();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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

      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: CustomNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
        className: styles.node,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, styles.node]
  );

  return (
    <div className={styles.container} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        className={styles.flow}
      >
        <Background color={theme.colorTextQuaternary} />
        <Controls />
      </ReactFlow>
    </div>
  );
});

const WrappedWorkflowCanvas = memo(() => (
  <ReactFlowProvider>
    <WorkflowCanvas />
  </ReactFlowProvider>
));

export default WrappedWorkflowCanvas; 