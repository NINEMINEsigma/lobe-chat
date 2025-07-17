import {
    BaseEdge,
    EdgeLabelRenderer,
    getStraightPath,
    getSimpleBezierPath,
    getSmoothStepPath,
    getBezierPath,
    useReactFlow,
    Edge
  } from '@xyflow/react';

import { PlusCircleFilled } from '@ant-design/icons';

  import { Tag } from 'antd';
import { useState } from 'react';
import NodeSelector from '@/components/EditorUI/Pannel/NodeSelector';

  const edgeStyle = {
    getStraightPath,
    getSimpleBezierPath,
    getSmoothStepPath,
    getBezierPath,
  }

 function CustomEdge({ id, sourceX, sourceY, targetX, targetY, data, selected }: any) {
    const { style } = data || {};
    const [showNodeSelector, setShowNodeSelector] = useState(false);
    const { setNodes, setEdges, getNode, getNodes, getEdges, getEdge } = useReactFlow();
    // @ts-ignore
    const [edgePath, labelX, labelY] = edgeStyle[style?.style || 'getBezierPath']({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });

    const handleAddNode = () => {
      setShowNodeSelector(true);
    }

    const handleNodeTypeSelect = (nodeType: string) => {
      const edge = getEdge(id) as Edge;
      const new_id = `ne_${new Date().getTime()}`;

      // 获取目标节点作为模板
      const targetNode = getNode(edge.target);

      // 创建新节点，使用选择的节点类型
      const newNode: any = {
        id: new_id,
        type: nodeType,
        position: {
          x: (sourceX + targetX) / 2 - 50, // 在边的中点位置
          y: (sourceY + targetY) / 2 - 25
        },
        selected: true,
        data: {
          style: {
            text: {
              content: `新${nodeType}节点`,
              color: "#fff",
              fontSize: 16,
              bold: false,
              textAlign: "center",
              lineHeight: 1.6,
              italic: false,
              underline: false,
              through: false
            },
            background: "rgb(12,14,16)",
            radius: 6,
            handles: [
              {
                direction: "top",
                type: "target"
              },
              {
                direction: "bottom",
                type: "source"
              },
              {
                direction: "right",
                type: "source"
              },
              {
                direction: "left",
                type: "target"
              }
            ],
            mouse: "default"
          },
          animation: {},
          interaction: {},
          info: {},
          order: targetNode?.data?.order || 0,
        }
      };

      // 创建新的边：从源节点到新节点
      const newEdge = {
        id: `e_${new Date().getTime()}`,
        source: edge.source,
        target: new_id,
        type: "fm-edge",
        selected: false,
        sourceHandle: edge.sourceHandle,
        targetHandle: `target-left-${new_id}`,
      };

      const newNodes = [...getNodes(), newNode];
      const newEdges = [...getEdges(), newEdge];

      // 重新布局
      const sortedNodes = newNodes
        .sort((a: any, b: any) => a.position.x - b.position.x)
        .map((n: any) => {
          return {
            ...n,
            data: {
              ...n.data,
              order: n.id !== new_id && n.data.order >= newNode.data.order ? n.data.order + 1 : n.data.order,
            },
            position: {
              x: n.id !== new_id && n.position.x >= newNode.position.x ? n.position.x + (newNode.width || 100) + 100 : n.position.x,
              y: n.position.y,
            }
          }
        });

      setNodes(sortedNodes);

      // 重新连线：将原来的边替换为从新节点到目标节点的边
      setEdges(newEdges.map((e: any) => {
        if (e.id === id) {
          return {
            ...e,
            source: new_id,
            target: edge.target,
            selected: false,
            sourceHandle: `source-right-${new_id}`,
            targetHandle: edge.targetHandle,
          }
        }
        return e;
      }));
    }

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            stroke: style ? style.color : '',
            strokeWidth: style ? style.width : 1,
          }}
        />
          <EdgeLabelRenderer>
            {
              selected &&
              <span
                style={{
                  position: 'absolute',
                  transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                  fontSize: 18,
                  display: 'flex',
                  zIndex: 10,
                  borderRadius: 18,
                  backgroundColor: '#fff',
                  color: '#1677ff',
                  cursor: 'pointer',
                  pointerEvents: 'all',
                }}
                className="nodrag nopan"
                onClick={handleAddNode}
              >
                <PlusCircleFilled />
              </span>
            }
            {
              !!style?.text?.content &&
                <div
                  style={{
                    position: 'absolute',
                    transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                    pointerEvents: 'all',
                  }}
                  className="nodrag nopan"
                  onClick={() => {
                  // setEdges((es) => es.filter((e) => e.id !== id));
                  }}
                >
                  <Tag color={style.labelColor || 'blue'} bordered={style.labelBorder}>
                    <span
                      style={{
                        color: style.text.color || '',
                        fontSize: style.text?.fontSize,
                        fontWeight: style.text?.bold ? 'bold' : 'normal',
                        lineHeight: style.text?.lineHeight + 'em',
                        textAlign: style.text?.textAlign,
                        textDecoration: style.text?.underline && style.text?.through ? 'line-through underline' :
                          style.text?.underline ? 'underline' :
                              style.text?.through ? 'line-through' :
                                'none',
                        fontStyle: style.text?.italic? 'italic' : 'normal',
                      }}
                    >
                      { style.text.content }
                    </span>
                  </Tag>
                </div>
            }

          </EdgeLabelRenderer>

        <NodeSelector
          visible={showNodeSelector}
          onClose={() => setShowNodeSelector(false)}
          onSelect={handleNodeTypeSelect}
        />
      </>
    );
  }

  const edgeTypes = {
    'fm-edge': CustomEdge,
  };

  export default edgeTypes;