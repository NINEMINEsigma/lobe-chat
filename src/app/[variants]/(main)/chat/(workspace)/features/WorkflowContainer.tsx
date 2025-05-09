'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';

const WorkflowDrawer = dynamic(() => import('./AgentWorkflow'), {
  ssr: false,
});

const WorkflowContainer = memo(() => {
  return <WorkflowDrawer />;
});

export default WorkflowContainer; 