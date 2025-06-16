'use client';

import React, { memo, useState } from 'react';
import { Button, Space, Dropdown, message, Modal } from 'antd';
import { createStyles } from 'antd-style';
import {
  Save,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  FileJson,
  Image,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize,
  MoreHorizontal
} from 'lucide-react';
import type { MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ token, css }) => ({
  toolbar: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: ${token.colorBgContainer};
    border-bottom: 1px solid ${token.colorBorderSecondary};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  `,
  toolbarSection: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  divider: css`
    width: 1px;
    height: 20px;
    background: ${token.colorBorderSecondary};
    margin: 0 8px;
  `,
  statusIndicator: css`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  `,
  saved: css`
    background: ${token.colorSuccessBg};
    color: ${token.colorSuccessText};
  `,
  modified: css`
    background: ${token.colorWarningBg};
    color: ${token.colorWarningText};
  `,
  running: css`
    background: ${token.colorInfoBg};
    color: ${token.colorInfoText};
  `
}));

interface FlowmixToolbarProps {
  onSave?: () => Promise<void>;
  onExport?: () => Promise<void>;
  onImport?: (file: File) => Promise<void>;
  onRun?: () => Promise<void>;
  onStop?: () => Promise<void>;
  onReset?: () => Promise<void>;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onClear?: () => Promise<void>;
  isModified?: boolean;
  isRunning?: boolean;
  isSaving?: boolean;
}

const FlowmixToolbarInner: React.FC<FlowmixToolbarProps> = ({
  onSave,
  onExport,
  onImport,
  onRun,
  onStop,
  onReset,
  onZoomIn,
  onZoomOut,
  onFitView,
  onClear,
  isModified = false,
  isRunning = false,
  isSaving = false
}) => {
  const { styles, cx } = useStyles();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: () => Promise<void>, actionName: string) => {
    try {
      setLoading(actionName);
      await action();
      message.success(`${actionName}成功`);
    } catch (error) {
      console.error(`${actionName}失败:`, error);
      message.error(`${actionName}失败`);
    } finally {
      setLoading(null);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onImport) {
        await handleAction(() => onImport(file), '导入');
      }
    };
    input.click();
  };

  const handleClear = () => {
    Modal.confirm({
      title: '清空工作流',
      content: '确定要清空当前工作流吗？此操作不可撤销。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        if (onClear) {
          await handleAction(onClear, '清空');
        }
      },
    });
  };

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'json',
      label: 'JSON格式',
      icon: <FileJson size={14} />,
      onClick: () => onExport && handleAction(onExport, '导出')
    },
    {
      key: 'image',
      label: '图片格式',
      icon: <Image size={14} />,
      disabled: true, // 暂未实现
    }
  ];

  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'copy',
      label: '复制工作流',
      icon: <Copy size={14} />,
      disabled: true, // 暂未实现
    },
    {
      key: 'reset',
      label: '重置工作流',
      icon: <RotateCcw size={14} />,
      onClick: () => onReset && handleAction(onReset, '重置')
    },
    {
      type: 'divider'
    },
    {
      key: 'clear',
      label: '清空工作流',
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: handleClear
    }
  ];

  const getStatusText = () => {
    if (isSaving) return '保存中...';
    if (isRunning) return '运行中';
    if (isModified) return '已修改';
    return '已保存';
  };

  const getStatusClass = () => {
    if (isRunning) return styles.running;
    if (isModified) return styles.modified;
    return styles.saved;
  };

  return (
    <div className={styles.toolbar}>
      {/* 左侧：主要操作 */}
      <div className={styles.toolbarSection}>
        <Button
          type="primary"
          icon={<Save size={14} />}
          onClick={() => onSave && handleAction(onSave, '保存')}
          loading={loading === '保存' || isSaving}
          disabled={!isModified}
        >
          保存
        </Button>

        <div className={styles.divider} />

        <Button
          icon={<Upload size={14} />}
          onClick={handleImport}
          loading={loading === '导入'}
        >
          导入
        </Button>

        <Dropdown menu={{ items: exportMenuItems }} placement="bottomLeft">
          <Button icon={<Download size={14} />}>
            导出
          </Button>
        </Dropdown>

        <div className={styles.divider} />

        {/* 执行控制 */}
        {!isRunning ? (
          <Button
            type="primary"
            ghost
            icon={<Play size={14} />}
            onClick={() => onRun && handleAction(onRun, '运行')}
            loading={loading === '运行'}
          >
            运行
          </Button>
        ) : (
          <Button
            danger
            icon={<Square size={14} />}
            onClick={() => onStop && handleAction(onStop, '停止')}
            loading={loading === '停止'}
          >
            停止
          </Button>
        )}
      </div>

      {/* 中间：视图控制 */}
      <div className={styles.toolbarSection}>
        <Button
          type="text"
          icon={<ZoomOut size={14} />}
          onClick={onZoomOut}
          title="缩小"
        />

        <Button
          type="text"
          icon={<Maximize size={14} />}
          onClick={onFitView}
          title="适合视图"
        />

        <Button
          type="text"
          icon={<ZoomIn size={14} />}
          onClick={onZoomIn}
          title="放大"
        />
      </div>

      {/* 右侧：状态和更多操作 */}
      <div className={styles.toolbarSection}>
        <div className={cx(styles.statusIndicator, getStatusClass())}>
          {getStatusText()}
        </div>

        <div className={styles.divider} />

        <Dropdown menu={{ items: moreMenuItems }} placement="bottomRight">
          <Button
            type="text"
            icon={<MoreHorizontal size={14} />}
            title="更多操作"
          />
        </Dropdown>

        <Button
          type="text"
          icon={<Settings size={14} />}
          title="设置"
          disabled // 暂未实现
        />
      </div>
    </div>
  );
};

export const FlowmixToolbar = memo(FlowmixToolbarInner);
export default FlowmixToolbar;