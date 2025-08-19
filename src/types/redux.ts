import { Workflow } from './workflow';

export interface WorkflowState {
  workflows: Workflow[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface RootState {
  workflows: WorkflowState;
  // Add other state slices as needed
}