import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { AgentStoreState, initialState } from './initialState';
import { AgentChatAction, createChatSlice } from './slices/chat/action';
import { WorkflowState, WorkflowActions, createWorkflowSlice } from './slices/workflow';

//  ===============  aggregate createStoreFn ============ //

export interface AgentStore extends WorkflowState, WorkflowActions, AgentChatAction, AgentStoreState {}

const createStore: StateCreator<AgentStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createChatSlice(...parameters),
  ...createWorkflowSlice(),
});

//  ===============  implement useStore ============ //

const devtools = createDevtools('agent');

export const useAgentStore = createWithEqualityFn<AgentStore>()(devtools(createStore), shallow);

export const getAgentStoreState = () => useAgentStore.getState();
