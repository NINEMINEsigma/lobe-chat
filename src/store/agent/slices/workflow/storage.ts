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
  return workflows[agentId];
};

export const saveWorkflowToStorage = (agentId: string, workflow: StoredWorkflow) => {
  try {
    const workflows = getStoredWorkflows();
    workflows[agentId] = workflow;
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