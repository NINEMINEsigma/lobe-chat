'use client';

import React, { memo } from 'react';
import { Card, Typography, Space } from 'antd';
import { createStyles } from 'antd-style';
import {
  MessageSquare,
  Settings,
  Play,
  Database,
  Code,
  Bot,
  Download,
  Upload,
  Filter,
  GitBranch,
  RotateCcw,
  Timer
} from 'lucide-react';

const { Text } = Typography;

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    width: 280px;
    height: 100%;
    max-height: 100%;
    background: ${token.colorBgContainer};
    border-right: 1px solid ${token.colorBorderSecondary};
    padding: 16px;
    overflow-y: auto;
    overflow-x: hidden;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    box-sizing: border-box;

    /* 确保滚动条可见且功能正常 */
    &::-webkit-scrollbar {
      width: 8px;
      background: transparent;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      margin: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.4);
      border-radius: 4px;
      transition: background 0.2s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.6);
      }

      &:active {
        background: rgba(0, 0, 0, 0.8);
      }
    }

    /* Firefox滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.05);
  `,
  nodesWrapper: css`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  `,
  category: css`
    margin-bottom: 20px;
  `,
  categoryTitle: css`
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 12px;
    color: ${token.colorTextHeading};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.8;
  `,
  nodeItem: css`
    position: relative;
    padding: 12px;
    border-radius: 10px;
    cursor: grab;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    overflow: hidden;

    /* 毛玻璃基础样式 */
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px) saturate(1.1);
    -webkit-backdrop-filter: blur(10px) saturate(1.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    /* 扩展的backdrop区域 */
    &::before {
      content: '';
      position: absolute;
      inset: 1px;
      height: calc(100% - 2px);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 9px;
      pointer-events: none;
      z-index: -1;
      overflow: hidden;
    }

    /* 毛玻璃边缘效果 */
    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(6px) brightness(1.1);
      -webkit-backdrop-filter: blur(6px) brightness(1.1);
      transform: translateY(100%);
      pointer-events: none;
    }

    &:hover {
      transform: translateY(-1px);
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.25);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12),
                  0 0 0 1px rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(15px) saturate(1.2);
      -webkit-backdrop-filter: blur(15px) saturate(1.2);
    }

    &:active {
      cursor: grabbing;
      transform: translateY(0px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    /* 分类特定的毛玻璃着色 */
    &[data-category="basic"] {
      background: rgba(59, 130, 246, 0.08);
      border-color: rgba(59, 130, 246, 0.15);

      &:hover {
        background: rgba(59, 130, 246, 0.12);
        border-color: rgba(59, 130, 246, 0.25);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.1),
                    0 0 0 1px rgba(59, 130, 246, 0.15);
      }
    }

    &[data-category="ai"] {
      background: rgba(147, 51, 234, 0.08);
      border-color: rgba(147, 51, 234, 0.15);

      &:hover {
        background: rgba(147, 51, 234, 0.12);
        border-color: rgba(147, 51, 234, 0.25);
        box-shadow: 0 6px 20px rgba(147, 51, 234, 0.1),
                    0 0 0 1px rgba(147, 51, 234, 0.15);
      }
    }

    &[data-category="function"] {
      background: rgba(34, 197, 94, 0.08);
      border-color: rgba(34, 197, 94, 0.15);

      &:hover {
        background: rgba(34, 197, 94, 0.12);
        border-color: rgba(34, 197, 94, 0.25);
        box-shadow: 0 6px 20px rgba(34, 197, 94, 0.1),
                    0 0 0 1px rgba(34, 197, 94, 0.15);
      }
    }

    &[data-category="control"] {
      background: rgba(249, 115, 22, 0.08);
      border-color: rgba(249, 115, 22, 0.15);

      &:hover {
        background: rgba(249, 115, 22, 0.12);
        border-color: rgba(249, 115, 22, 0.25);
        box-shadow: 0 6px 20px rgba(249, 115, 22, 0.1),
                    0 0 0 1px rgba(249, 115, 22, 0.15);
      }
    }

    &[data-category="config"] {
      background: rgba(107, 114, 128, 0.08);
      border-color: rgba(107, 114, 128, 0.15);

      &:hover {
        background: rgba(107, 114, 128, 0.12);
        border-color: rgba(107, 114, 128, 0.25);
        box-shadow: 0 6px 20px rgba(107, 114, 128, 0.1),
                    0 0 0 1px rgba(107, 114, 128, 0.15);
      }
    }
  `,
  nodeIcon: css`
    font-size: 18px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
  `,
  nodeContent: css`
    flex: 1;
    position: relative;
    z-index: 2;
  `,
  nodeTitle: css`
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 2px;
    color: ${token.colorText};
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  `,
  nodeDesc: css`
    font-size: 11px;
    color: ${token.colorTextTertiary};
    line-height: 1.3;
    opacity: 0.9;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  `
}));

interface NodeType {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  category: string;
}

const nodeTypes: NodeType[] = [
  // 基础节点
  {
    id: 'input',
    type: 'input',
    title: '输入节点',
    description: '接收用户输入文本',
    icon: Download,
    category: 'basic'
  },
  {
    id: 'output',
    type: 'output',
    title: '输出节点',
    description: '输出最终结果',
    icon: Upload,
    category: 'basic'
  },
  {
    id: 'chat',
    type: 'chat',
    title: '对话节点',
    description: '处理对话交互',
    icon: MessageSquare,
    category: 'basic'
  },

  // AI节点 - 核心节点
  {
    id: 'llm',
    type: 'llm',
    title: '大模型节点',
    description: '调用大语言模型处理',
    icon: Bot,
    category: 'ai'
  },

  // TODO: 待扩展的AI节点 - 暂时注释，保留用于后续功能增强
  // {
  //   id: 'agent',
  //   type: 'agent',
  //   title: '智能体节点',
  //   description: '智能体代理处理',
  //   icon: Bot,
  //   category: 'ai'
  // },

  // 功能节点
  {
    id: 'function',
    type: 'function',
    title: '函数节点',
    description: '执行自定义函数',
    icon: Code,
    category: 'function'
  },
  {
    id: 'database',
    type: 'database',
    title: '数据库节点',
    description: '数据库操作',
    icon: Database,
    category: 'function'
  },

  // 控制节点
  {
    id: 'condition',
    type: 'condition',
    title: '条件节点',
    description: '条件判断分支',
    icon: GitBranch,
    category: 'control'
  },
  {
    id: 'filter',
    type: 'filter',
    title: '过滤节点',
    description: '数据过滤处理',
    icon: Filter,
    category: 'control'
  },
  {
    id: 'loop',
    type: 'loop',
    title: '循环节点',
    description: '循环执行处理',
    icon: RotateCcw,
    category: 'control'
  },
  {
    id: 'delay',
    type: 'delay',
    title: '延时节点',
    description: '延时等待处理',
    icon: Timer,
    category: 'control'
  },

    // 配置节点
  {
    id: 'settings',
    type: 'settings',
    title: '设置节点',
    description: '配置参数设置',
    icon: Settings,
    category: 'config'
  }
];

const categories = {
  basic: '基础节点',
  ai: 'AI节点',
  function: '功能节点',
  control: '控制节点',
  config: '配置节点'
};

interface FlowmixNodesProps {
  onNodeDragStart?: (nodeType: string) => void;
}

const FlowmixNodes: React.FC<FlowmixNodesProps> = ({ onNodeDragStart }) => {
  const { styles } = useStyles();

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeData', JSON.stringify({
      type: nodeType,
      label: nodeTypes.find(n => n.type === nodeType)?.title || nodeType
    }));
    event.dataTransfer.effectAllowed = 'move';
    onNodeDragStart?.(nodeType);
  };

  const groupedNodes = nodeTypes.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, NodeType[]>);

  return (
    <div className={styles.container}>
      <div className={styles.nodesWrapper}>
        {Object.entries(groupedNodes).map(([category, nodes]) => (
          <div key={category} className={styles.category}>
            <Text className={styles.categoryTitle}>
              {categories[category as keyof typeof categories]}
            </Text>
            <div>
              {nodes.map((node) => {
                return (
                  <div
                    key={node.id}
                    className={styles.nodeItem}
                    data-category={node.category}
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type)}
                  >
                    <div className={styles.nodeIcon}>
                      {node.type === 'input' ? '📥' :
                       node.type === 'output' ? '📤' :
                       node.type === 'chat' ? '💬' :
                       node.type === 'llm' ? '🤖' :
                       node.type === 'agent' ? '🤖' :
                       node.type === 'function' ? '⚙️' :
                       node.type === 'database' ? '🗃️' :
                       node.type === 'condition' ? '🔀' :
                       node.type === 'filter' ? '🔍' :
                       node.type === 'loop' ? '🔄' :
                       node.type === 'delay' ? '⏰' :
                       node.type === 'settings' ? '⚙️' : '📦'}
                    </div>
                    <div className={styles.nodeContent}>
                      <div className={styles.nodeTitle}>{node.title}</div>
                      <div className={styles.nodeDesc}>{node.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(FlowmixNodes);