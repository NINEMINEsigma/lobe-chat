'use client';

import { Drawer } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { useSessionStore } from '@/store/session';
import Workflow from '@/components/Workflow';

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
      push={false}
      styles={{
        body: {
          padding: 0,
          overflow: 'hidden',
        },
        content: {
          boxShadow: 'none',
        },
        header: {
          paddingBottom: 8,
        },
      }}
      title={t('editWorkflow')}
    >
      { /* Project-Label Workflow */ }
      <Workflow id={id} />
    </Drawer>
  );
});

export default WorkflowDrawer;
