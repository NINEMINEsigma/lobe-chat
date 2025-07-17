import {
  Handle, NodeResizer, useUpdateNodeInternals,
  useReactFlow
} from '@xyflow/react';
import { PlusCircleFilled } from '@ant-design/icons';
import  IBaseSchema from './NodeType';
import { useEffect, useRef, useState } from 'react';
import { Tooltip, Tag } from 'antd';
import NodeSelector from '@/components/EditorUI/Pannel/NodeSelector';

function withBaseNode(Component: any) {
  return function(props: IBaseSchema) {
    const { id, data, isConnectable, selected } = props;
    const updateNodeInternals = useUpdateNodeInternals();
    const { transform, handles, mouse } = data.style || {};
    const { animation } = data.animation || {};
    const ref = useRef<any>(null);
    const isPreview = location.search.includes('preview');
    const [showNodeSelector, setShowNodeSelector] = useState(false);

    const reactFlow = useReactFlow();

    const handleAddNode = () => {
      // 如果没有加载插件，使用原有逻辑
      setShowNodeSelector(true);
    }

    const handleNodeTypeSelect = (nodeType: string) => {
      // @ts-ignore
      const x = props.positionAbsoluteX + props.width + 100;
      // @ts-ignore
      const y = props.positionAbsoluteY;

      // 根据选择的节点类型创建新节点
      const newNode = {
        id: `n_${new Date().getTime()}`,
        type: nodeType,
        position: {x, y},
        selected: false,
        data: {
          // 使用默认数据或从插件获取默认数据
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
          order: (props.data.order || 0) + 1,
        }
      };

      // 添加节点
      reactFlow.addNodes(newNode);

      // 添加边
      const edge = {
        id: `e_${new Date().getTime()}`,
        source: props.id,
        target: newNode.id,
        type: "fm-edge",
        sourceHandle: `source-right-${props.id}`,
        targetHandle: `target-left-${newNode.id}`,
      }
      reactFlow.addEdges(edge);
    }

    useEffect(() => {
      updateNodeInternals(id);
    }, [id, updateNodeInternals, handles])

    return (
      <>
        <Tooltip
          title={!isPreview ? "双击节点编辑" : ""}
          getPopupContainer={() => ref.current}
        >
          <div
            className={animation ? `animate__animated animate__${animation.name}` : ''}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: mouse,
              transform,
            ...(animation && {
                animationDuration: `${animation.dur}s`,
                animationIterationCount: animation.times > 500 ? 'infinite' : animation.times,
                animationDelay: `${animation.delay}s`,
              })
            }}
            ref={ref}
          >
            <NodeResizer
              color="#1677ff"
              isVisible={selected || false}
              minWidth={30}
              minHeight={30}
            />
            {
                !handles ? null :
                  handles.map((item: any, i: number) => {
                    const hid = `${item.type}-${item.direction}-${id}`
                    return <Handle
                              key={i}
                              id={hid}
                              type={item.type}
                              position={item.direction}
                              // style={handleStyle}
                              isConnectable={isConnectable}
                          />
                  })
            }

            <Component {...props} />

            {
              !isPreview && selected && (
                <div
                  style={{
                    position: 'absolute',
                    right: -15,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    cursor: 'pointer',
                    fontSize: 18,
                    color: '#1677ff',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    border: '1px solid #1677ff',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={handleAddNode}
                  className="nodrag nopan"
                >
                  <PlusCircleFilled />
                </div>
              )
            }
          </div>
        </Tooltip>

        <NodeSelector
          visible={showNodeSelector}
          onClose={() => setShowNodeSelector(false)}
          onSelect={handleNodeTypeSelect}
        />
      </>
    );
  }
}

export default withBaseNode;