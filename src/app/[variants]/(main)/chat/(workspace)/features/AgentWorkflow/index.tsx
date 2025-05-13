'use client';

import { Drawer } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import PanelTitle from '@/components/PanelTitle';
import { useSessionStore } from '@/store/session';

const WorkflowDrawer = memo(() => {
  const { t } = useTranslation('common');
  const [showAgentWorkflow] = useAgentStore((s) => [s.showAgentWorkflow]);
  const id = useSessionStore((s) => s.activeId);

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

export default WorkflowDrawer;
