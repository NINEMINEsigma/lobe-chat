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
  Input,
  Output,
  Filter,
  Branch,
  Loop,
  Timer
} from 'lucide-react';

const { Text } = Typography;

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    width: 280px;
    height: 100%;
    background: ${token.colorBgContainer};
    border-right: 1px solid ${token.colorBorderSecondary};
    padding: 16px;
    overflow-y: auto;
  `,
  category: css`
    margin-bottom: 16px;
  `,
  categoryTitle: css`
    font-weight: 600;
    margin-bottom: 8px;
    color: ${token.colorTextHeading};
  `,
  nodeItem: css`
    padding: 8px;
    border: 1px solid ${token.colorBorder};
    border-radius: 6px;
    cursor: grab;
    background: ${token.colorBgContainer};
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    &:hover {
      border-color: ${token.colorPrimary};
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    &:active {
      cursor: grabbing;
    }
  `,
  nodeIcon: css`
    color: ${token.colorPrimary};
    flex-shrink: 0;
  `,
  nodeContent: css`
    flex: 1;
  `,
  nodeTitle: css`
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 2px;
  `,
  nodeDesc: css`
    font-size: 11px;
    color: ${token.colorTextTertiary};
    line-height: 1.2;
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
    description: '接收外部输入数据',
    icon: Input,
    category: 'basic'
  },
  {
    id: 'output',
    type: 'output',
    title: '输出节点',
    description: '输出处理结果',
    icon: Output,
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

  // AI节点
  {
    id: 'llm',
    type: 'llm',
    title: 'LLM节点',
    description: '大语言模型处理',
    icon: Bot,
    category: 'ai'
  },
  {
    id: 'agent',
    type: 'agent',
    title: '智能体节点',
    description: '智能体代理处理',
    icon: Bot,
    category: 'ai'
  },

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
    icon: Branch,
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
    icon: Loop,
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

const FlowmixNodesInner: React.FC<FlowmixNodesProps> = ({ onNodeDragStart }) => {
  const { styles } = useStyles();

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
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
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {Object.entries(groupedNodes).map(([category, nodes]) => (
          <div key={category} className={styles.category}>
            <Text className={styles.categoryTitle}>
              {categories[category as keyof typeof categories]}
            </Text>
            <div>
              {nodes.map((node) => {
                const IconComponent = node.icon;
                return (
                  <div
                    key={node.id}
                    className={styles.nodeItem}
                    draggable
                    onDragStart={(e) => handleDragStart(e, node.type)}
                  >
                    <IconComponent size={16} className={styles.nodeIcon} />
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
      </Space>
    </div>
  );
};

export const FlowmixNodes = memo(FlowmixNodesInner);
export default FlowmixNodes;