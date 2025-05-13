'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import WorkflowNodes from './Modules/Nodes';
import WorkflowCanvas from './Modules/Canvas';

const Workflow = memo(() => {
  return (
    <Flexbox horizontal style={{ height: '100vh' }}>
      <WorkflowNodes />
      <WorkflowCanvas />
    </Flexbox>
  );
});

export default Workflow;
