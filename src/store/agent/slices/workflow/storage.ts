import { LobeAgentWorkflow } from '@/types/agent/workflow';

const WORKFLOW_STORAGE_KEY = 'LOBE_AGENT_WORKFLOWS';

interface StoredWorkflow {
  definition: LobeAgentWorkflow;
  status?: 'active' | 'inactive';
  meta?: {
    name?: string;
    description?: string;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
  };
}

interface WorkflowStorage {
  [agentId: string]: StoredWorkflow;
}

export const getStoredWorkflows = (): WorkflowStorage => {
  try {
    const stored = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading workflows from localStorage:', error);
    return {};
  }
};

export const getStoredWorkflow = (agentId: string): StoredWorkflow | undefined => {
  const workflows = getStoredWorkflows();
  const workflow = workflows[agentId];

  // 添加调试日志，验证parameterMappings是否正确反序列化
  if (workflow) {
    console.log('[WorkflowStorage] 从localStorage加载工作流:', {
      agentId,
      nodesCount: workflow.definition?.nodes?.length || 0,
      nodesWithParameterMappings: workflow.definition?.nodes?.filter((node: any) =>
        node.data?.parameterMappings && node.data.parameterMappings.length > 0
      ).length || 0,
      sampleParameterMappings: workflow.definition?.nodes?.find((node: any) =>
        node.data?.parameterMappings && node.data.parameterMappings.length > 0
      )?.data?.parameterMappings || null
    });
  }

  return workflow;
};

export const saveWorkflowToStorage = (agentId: string, workflow: StoredWorkflow) => {
  try {
    const workflows = getStoredWorkflows();
    workflows[agentId] = workflow;

    // 添加调试日志，验证parameterMappings是否正确序列化
    console.log('[WorkflowStorage] 保存工作流到localStorage:', {
      agentId,
      nodesCount: workflow.definition?.nodes?.length || 0,
      nodesWithParameterMappings: workflow.definition?.nodes?.filter((node: any) =>
        node.data?.parameterMappings && node.data.parameterMappings.length > 0
      ).length || 0,
      serializedData: JSON.stringify(workflow, null, 2)
    });

    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflows));
  } catch (error) {
    console.error('Error saving workflow to localStorage:', error);
  }
};

export const removeWorkflowFromStorage = (agentId: string) => {
  try {
    const workflows = getStoredWorkflows();
    delete workflows[agentId];
    localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflows));
  } catch (error) {
    console.error('Error removing workflow from localStorage:', error);
  }
};