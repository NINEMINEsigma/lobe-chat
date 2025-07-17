'use client';

import { memo } from 'react';
import { useSearchParams } from 'next/navigation';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import SystemRoleContent from './SystemRoleContent';

const SystemRole = memo(() => {
  const { isAgentEditable: showSystemRole } = useServerConfigStore(featureFlagsSelectors);
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const searchParams = useSearchParams();
  const assistant = searchParams.get('assistant');

  // 如果是schedule助手模式，隐藏SystemRole
  if (assistant === 'schedule') {
    return null;
  }

  return showSystemRole && !isInbox && <SystemRoleContent />;
});

export default SystemRole;
