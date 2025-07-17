import { useState, memo, useEffect } from 'react';
import {
  ReactFlow,
  SelectionMode,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  Edge,
  Node,
  useReactFlow,
  useNodesInitialized
} from '@xyflow/react';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import PanelControl from './PanelControl';
import nodeTypes from './components/Nodes';
import edgeTypes from './components/Edges';
import nodeColor from './lib/miniColorMap';
import { AppState } from '../../type';
import '@xyflow/react/dist/style.css';
import './modern-theme.less';

const panOnDrag = [1, 2];

const rfStyle = {
  backgroundColor: '#f7f9fb',
};



interface IFlowProps extends Pick<AppState, 'data' | 'onEdgesChange' | 'onNodesChange' | 'setEdges' | 'setNodes' | 'onConnect' | 'clear' | 'updateViewport'> {
  fitView?: boolean;
  isPreview?: boolean;
  theme?: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
  onNodeClick: (node: Node) => void;
  onNodeDoubleClick: (node: Node) => void;
  onNodeDragStart: (node: Node) => void;
  onNodeDragStop: (node: Node) => void;
  onEdgeClick?: (edge: Edge) => void;
  onExitPreview?: () => void;
  onContextClick?: (key: 'copy' | 'del', el: any) => void;
}

function Flow(props: IFlowProps) {
  const [viewport, setViewport] = useState({x: 0, y: 0, zoom: 1});
  const [menu, setMenu] = useState<MenuProps['items']>([]);
  const [curContextEl, setCurContextEl] = useState<any>(null);
  // 当前画布元素的拖拽模型
  const [panMode, setPanMode] = useState<'select' | 'move'>('select');

  // 添加useReactFlow hook
  const reactFlowInstance = useReactFlow();
  const nodesInitialized = useNodesInitialized();

  // 对编辑器暴露的属性
  const {
    theme = 'light',
    onThemeChange,
    onNodeClick,
    onNodeDoubleClick,
    onNodeDragStart,
    onNodeDragStop,
    fitView = false,
    onNodesChange,
    onEdgeClick,
    onEdgesChange,
    onConnect,
    clear,
    updateViewport,
    data,
    isPreview = false,
    onExitPreview,
    onContextClick,
   } = props;

  // 改进fitView调用逻辑
  useEffect(() => {
    if (fitView && data.nodes.length > 0 && nodesInitialized && reactFlowInstance) {
      // 使用requestAnimationFrame确保DOM更新完成
      requestAnimationFrame(() => {
        reactFlowInstance.fitView({
          padding: 0.1,
          duration: 800,
          includeHiddenNodes: false
        });
      });
    }
  }, [data.nodes.length, fitView, nodesInitialized, reactFlowInstance]);

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    onNodeClick && onNodeClick(node);
    setMenu([
      {
        label: '复制',
        key: 'copy',
      },
      {
        label: '删除',
        key: 'del',
      }
    ])
  }

  const handleNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    onNodeDoubleClick && onNodeDoubleClick(node);
  }

  const handleEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    onEdgeClick && onEdgeClick(edge);
    setMenu([
      {
        label: '删除',
        key: 'del',
      }
    ])
  }

  const handleNodeDragEnd = (event: React.MouseEvent, node: Node, nodes: Node[]) => {
    onNodeDragStop && onNodeDragStop(node);
  }

  const handleClear = () => {
    clear();
  }

  const handleMenuItemClick = (row: any) => {
    onContextClick &&  onContextClick(row.key, curContextEl);
  }

  const handlePanModeChange = (type:'select' |'move') => {
    setPanMode(type);
  }

  useEffect(() => {
    updateViewport && updateViewport(viewport);
  }, [viewport])

  // console.log('---- Flow 渲染 -----')

  // 构建主题类名
  const themeClassName = `modern-flow-theme ${theme === 'dark' ? 'dark-theme' : ''}`.trim();

  return (
    <Dropdown
      menu={{ items: menu, onClick: handleMenuItemClick }}
      trigger={['contextMenu']}
    >
        <div
          className={themeClassName}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
            <ReactFlow
                nodes={isPreview ? data.nodes.map(v => {
                  return {
                    ...v,
                    selected: false,
                    data: {
                      ...v.data,
                      theme // 传递主题给节点
                    }
                  }
                }) : data.nodes.map(v => ({
                  ...v,
                  data: {
                    ...v.data,
                    theme // 传递主题给节点
                  }
                }))}
                edges={isPreview ? data.edges.map(v => {
                  return {
                    ...v,
                    selected: false
                  }
                }) : data.edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                minZoom={0.1}
                maxZoom={100}
                // @ts-ignore
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodeClick={handleNodeClick}
                onNodeDoubleClick={handleNodeDoubleClick}
                onEdgeClick={handleEdgeClick}
                // @ts-ignore
                onNodeDragStart={onNodeDragStart}
                // @ts-ignore
                onNodeDragStop={handleNodeDragEnd}
                panOnScroll
                colorMode={theme}
                selectionOnDrag
                panOnDrag={panMode === 'select' ? panOnDrag : undefined}
                onNodeContextMenu={(event: React.MouseEvent, node: Node) => {
                  event.preventDefault();
                  node && setCurContextEl(node);
                }}
                onEdgeContextMenu={(event: React.MouseEvent, edge: Edge) => {
                  event.preventDefault();
                  edge && setCurContextEl(edge);
                }}
                onSelectionDragStop={(event: React.MouseEvent, nodes: Node[]) => {
                  event.preventDefault();
                  if (nodes.length === 1) {
                    setMenu([
                      {
                        label: '复制',
                        key: 'copy',
                      },
                      {
                        label: '删除',
                        key: 'del',
                      }
                    ])
                    setCurContextEl(nodes[0]);
                  } else {
                    setMenu([])
                  }
                }}
                zoomOnScroll={false}
                selectionMode={SelectionMode.Partial}
                onViewportChange={(viewport) => {
                  setViewport(viewport);
                }}
                elevateNodesOnSelect={false}
                fitView={fitView}
                style={{
                  background: 'transparent',
                  width: '100%',
                  height: '100%'
                }}
            >
                <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
                <Controls />
                <Background color="#ccc" variant={BackgroundVariant.Dots} />
                <Panel position={isPreview ? "top-center" : "top-left"}>
                  <PanelControl
                    theme={theme}
                    pandMode={panMode}
                    isPreview={isPreview}
                    onPanModeChange={handlePanModeChange}
                    onThemeChange={onThemeChange}
                    onClear={handleClear}
                    onExitPreview={onExitPreview}
                  />
                </Panel>
            </ReactFlow>
        </div>
    </Dropdown>
  );
}

export default memo(Flow)