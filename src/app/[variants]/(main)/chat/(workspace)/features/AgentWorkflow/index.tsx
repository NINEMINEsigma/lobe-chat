'use client';

import { Drawer } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import dynamic from 'next/dynamic';

import { useAgentStore } from '@/store/agent';
import PanelTitle from '@/components/PanelTitle';

const WorkflowDrawer = memo(() => {
  const { t } = useTranslation('common');
  const [showAgentWorkflow] = useAgentStore((s) => [s.showAgentWorkflow]);

  return (
    <Drawer
      height={'100vh'}
      onClose={() => useAgentStore.setState({ showAgentWorkflow: false })}
      open={showAgentWorkflow}
      placement={'bottom'}
      title={t('editWorkflow')}
    >
      <Flexbox gap={16} padding={16}>
        <PanelTitle title={t('editWorkflow')} />
        {/* 这里添加工作流编辑的具体内容 */}
      </Flexbox>
    </Drawer>
  );
});

export { WorkflowDrawer };
