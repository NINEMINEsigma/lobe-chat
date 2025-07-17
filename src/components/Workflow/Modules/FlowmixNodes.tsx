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
import { getAllNodeConfigs, NODE_CATEGORIES } from '@/constants/workflow/nodeConfig';

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

// 移除本地接口定义，使用统一的 NodeTypeConfig

// 使用统一的节点配置，移除重复定义
const nodeTypes = getAllNodeConfigs();

// 使用统一的分类配置
const categories = NODE_CATEGORIES;

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
                      {node.icon}
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