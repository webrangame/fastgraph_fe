import { createSlice } from '@reduxjs/toolkit';

const workflowSlice = createSlice({
  name: 'workflows',
  initialState: {
    workflows: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addWorkflow: (state, action) => {
      state.workflows.push(action.payload);
    },
    removeWorkflow: (state, action) => {
      state.workflows = state.workflows.filter(workflow => workflow.id !== action.payload);
    },
    removeAllWorkflows: (state) => {
      state.workflows = [];
    },
    updateWorkflow: (state, action) => {
      const index = state.workflows.findIndex(workflow => workflow.id === action.payload.id);
      if (index !== -1) {
        state.workflows[index] = action.payload;
      }
    },
    setWorkflows: (state, action) => {
      state.workflows = action.payload;
    },
  },
});

export const { addWorkflow, removeWorkflow, removeAllWorkflows, updateWorkflow, setWorkflows } = workflowSlice.actions;
export default workflowSlice.reducer;