'use client';

import React, { memo, useCallback } from 'react';
import { Button, Space, Tooltip, Divider, message, Badge } from 'antd';
import {
  SaveOutlined,
  FileAddOutlined,
  ImportOutlined,
  ExportOutlined,
  PlayCircleOutlined,
  UndoOutlined,
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useReactFlow } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { createStyles } from 'antd-style';

// 按钮分类枚举
enum ButtonCategory {
  PRIMARY = 'primary',    // 主要操作：保存、运行
  SECONDARY = 'secondary', // 次要操作：导入、导出、清空
  DANGER = 'danger',      // 危险操作
  TOOL = 'tool'          // 工具操作：缩放、信息
}

// 样式配置接口
interface ButtonStyleConfig {
  category: ButtonCategory;
  gradient: string;
  hoverGradient: string;
  textColor: string;
  shadow: string;
}

const useStyles = createStyles(({ token, css, isDarkMode }) => ({
  toolbar: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: 12px;
    padding: 16px 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, ${isDarkMode ? '0.3' : '0.12'});
    backdrop-filter: blur(10px);

    @media (max-width: 768px) {
      padding: 12px 16px;
      border-radius: 8px;
    }
  `,
  leftActions: css`
    display: flex;
    align-items: center;
    gap: 12px;

    @media (max-width: 768px) {
      gap: 8px;
    }
  `,
  rightActions: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  statusBadge: css`
    margin-left: 16px;
  `,
  // 主要操作按钮样式（保存、运行）
  primaryButton: css`
    position: relative;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    font-weight: 500;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    &:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
      color: #ffffff;
    }

    &:active {
      transform: translateY(0px) scale(0.98);
      transition: all 0.1s ease;
    }

    &:focus {
      outline: 2px solid ${token.colorPrimary};
      outline-offset: 2px;
      color: #ffffff;
    }

    &:disabled {
      background: ${token.colorBgContainerDisabled};
      color: ${token.colorTextDisabled};
      box-shadow: none;
      transform: none;
    }
  `,
  // 次要操作按钮样式（导入、导出、清空）
  secondaryButton: css`
    position: relative;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: #ffffff;
    font-weight: 500;
    box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    &:hover {
      background: linear-gradient(135deg, #e084ec 0%, #e6485a 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(240, 147, 251, 0.6);
      color: #ffffff;
    }

    &:active {
      transform: translateY(0px) scale(0.98);
      transition: all 0.1s ease;
    }

    &:focus {
      outline: 2px solid ${token.colorPrimary};
      outline-offset: 2px;
      color: #ffffff;
    }
  `,
  // 工具操作按钮样式（缩放、信息）
  toolButton: css`
    position: relative;
    background: rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, 0.05);
    border: 1px solid rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, 0.1);
    border-radius: 6px;
    color: ${token.colorText};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);

    &:hover {
      background: rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, 0.1);
      border-color: rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, 0.2);
      transform: translateY(-1px);
      color: ${token.colorText};
    }

    &:active {
      transform: translateY(0px) scale(0.98);
      transition: all 0.1s ease;
    }

    &:focus {
      outline: 2px solid ${token.colorPrimary};
      outline-offset: 2px;
    }
  `,
  // 响应式按钮文字隐藏
  hiddenTextOnMobile: css`
    @media (max-width: 768px) {
      .ant-btn-text {
        display: none;
      }
    }
  `
}));

interface FlowmixToolbarProps {
  onSave?: () => void;
  onCreate?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onRun?: () => void;
  isModified?: boolean;
  isRunning?: boolean;
  agentId?: string;
}

const FlowmixToolbar = memo<FlowmixToolbarProps>(({
  onSave,
  onCreate,
  onImport,
  onExport,
  onRun,
  isModified = false,
  isRunning = false,
  agentId
}) => {
  const { styles } = useStyles();
  const { t } = useTranslation('common');
  const reactFlow = useReactFlow();

  // 处理保存
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave();
      message.success('工作流已保存');
    }
  }, [onSave]);

  // 处理创建
  const handleCreate = useCallback(() => {
    if (onCreate) {
      onCreate();
      message.info('工作流已清空');
    }
  }, [onCreate]);

  // 处理导入
  const handleImport = useCallback(() => {
    if (onImport) {
      onImport();
    } else {
      message.warning('导入功能开发中');
    }
  }, [onImport]);

  // 处理导出
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
    } else {
      const data = reactFlow.toObject();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-${agentId || 'unnamed'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('工作流已导出');
    }
  }, [onExport, reactFlow, agentId]);

  // 处理运行
  const handleRun = useCallback(() => {
    if (onRun) {
      onRun();
    } else {
      message.info('运行功能开发中');
    }
  }, [onRun]);

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    reactFlow.zoomIn();
  }, [reactFlow]);

  const handleZoomOut = useCallback(() => {
    reactFlow.zoomOut();
  }, [reactFlow]);

  const handleFitView = useCallback(() => {
    reactFlow.fitView();
  }, [reactFlow]);

  return (
    <div className={styles.toolbar}>
      <div className={styles.leftActions}>
        <Space>
          <Tooltip title="保存工作流">
            <Button
              type={isModified ? 'primary' : 'default'}
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={!isModified}
              className={styles.primaryButton}
            >
              保存
            </Button>
          </Tooltip>

          <Tooltip title="清空工作流">
            <Button
              icon={<FileAddOutlined />}
              onClick={handleCreate}
              className={styles.secondaryButton}
            >
              清空
            </Button>
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip title="导入工作流">
            <Button
              icon={<ImportOutlined />}
              onClick={handleImport}
              className={styles.secondaryButton}
            >
              导入
            </Button>
          </Tooltip>

          <Tooltip title="导出工作流">
            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
              className={styles.secondaryButton}
            >
              导出
            </Button>
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip title={isRunning ? '工作流运行中' : '运行工作流'}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleRun}
              loading={isRunning}
              disabled={isRunning}
              className={styles.primaryButton}
            >
              {isRunning ? '运行中' : '运行'}
            </Button>
          </Tooltip>
        </Space>

        {isModified && (
          <Badge
            status="warning"
            text="未保存的更改"
            className={styles.statusBadge}
          />
        )}
      </div>

      <div className={styles.rightActions}>
        <Space>
          <Tooltip title="放大">
            <Button
              icon={<ZoomInOutlined />}
              onClick={handleZoomIn}
              size="small"
              className={styles.toolButton}
            />
          </Tooltip>

          <Tooltip title="缩小">
            <Button
              icon={<ZoomOutOutlined />}
              onClick={handleZoomOut}
              size="small"
              className={styles.toolButton}
            />
          </Tooltip>

          <Tooltip title="适应视图">
            <Button
              icon={<ExpandOutlined />}
              onClick={handleFitView}
              size="small"
              className={styles.toolButton}
            />
          </Tooltip>

          <Divider type="vertical" />

          <Tooltip title="工作流信息">
            <Button
              icon={<InfoCircleOutlined />}
              size="small"
              onClick={() => message.info(`代理ID: ${agentId || '未知'}`)}
              className={styles.toolButton}
            />
          </Tooltip>
        </Space>
      </div>
    </div>
  );
});

FlowmixToolbar.displayName = 'FlowmixToolbar';

export default FlowmixToolbar;