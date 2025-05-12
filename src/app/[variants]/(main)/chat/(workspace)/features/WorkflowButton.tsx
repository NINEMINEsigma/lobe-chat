'use client';

import { ActionIcon } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';

import { useSessionStore } from '@/store/session';

import { Workflow } from 'lucide-react';

import { DESKTOP_HEADER_ICON_SIZE, MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useWorkspaceModal } from '@/hooks/useWorkspaceModal';

interface WorkflowButtonProps {
  mobile?: boolean;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const WorkflowButton = memo<WorkflowButtonProps>(({ mobile, setOpen, open }) => {
  const { t } = useTranslation('common');
  
  const id = useSessionStore((s) => s.activeId);

  return (
    <>
      <ActionIcon
        icon={Workflow}
        onClick={() => /* Project-Label Workflow */console.log('workflow')}
        size={mobile ? MOBILE_HEADER_ICON_SIZE : DESKTOP_HEADER_ICON_SIZE}
        title={t('editWorkflow')}
      />
    </>
  );
});

export default WorkflowButton;