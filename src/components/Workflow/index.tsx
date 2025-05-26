'use client';

import { memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Edge } from '@xyflow/react';
import { useAgentStore } from '@/store/agent';
import { LobeAgentWorkflowNode } from '@/types/agent/workflow';

import WorkflowNodes from './Modules/Nodes';
import WorkflowCanvas from './Modules/Canvas';
import WorkflowToolbar from './Modules/Toolbar';

interface WorkflowProps {
  id: string;
}

const Workflow = memo<WorkflowProps>(({ id }) => {
  const { currentWorkflow, loadWorkflow, updateWorkflow, resetWorkflow } = useAgentStore();

  useEffect(() => {
    resetWorkflow();
    loadWorkflow(id);
  }, [id, loadWorkflow, resetWorkflow]);

  const onWorkflowChange = (nodes: LobeAgentWorkflowNode[], edges: Edge[]) => {
    updateWorkflow({
      nodes,
      edges,
      version: '1.0',
    });
  };

  return (
    <Flexbox gap={16} style={{ height: '100vh' }}>
      <WorkflowToolbar />
      <Flexbox horizontal style={{ flex: 1 }}>
        <WorkflowNodes />
        <WorkflowCanvas
          nodes={currentWorkflow?.nodes || []}
          edges={currentWorkflow?.edges || []}
          onNodesChange={onWorkflowChange}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default Workflow;
