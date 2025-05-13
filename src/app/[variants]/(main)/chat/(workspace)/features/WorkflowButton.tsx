'use client';

import { ActionIcon } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';

import { useSessionStore } from '@/store/session';
import { useAgentStore } from '@/store/agent';

import { Workflow } from 'lucide-react';

import { DESKTOP_HEADER_ICON_SIZE, MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';

const AgentWorkflow = dynamic(() => import('./AgentWorkflow'), {
  ssr: false,
});

const WorkflowButton = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { t } = useTranslation('common');
  
  const id = useSessionStore((s) => s.activeId);

  return (
    <>
      <ActionIcon
        icon={Workflow}
        onClick={() => /* Project-Label Workflow */useAgentStore.setState({ showAgentWorkflow: true })}
        size={mobile ? MOBILE_HEADER_ICON_SIZE : DESKTOP_HEADER_ICON_SIZE}
        title={t('editWorkflow')}
      />
      <AgentWorkflow key={id} />
    </>
  );
});

export default WorkflowButton;