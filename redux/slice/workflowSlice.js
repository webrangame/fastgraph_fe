import { createSlice } from '@reduxjs/toolkit';

const workflowSlice = createSlice({
  name: 'workflows',
  initialState: {
    workflows: [],
    status: 'idle',
    error: null,
    dataId: null, // Add dataId to Redux state
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
    setDataId: (state, action) => {
      state.dataId = action.payload;
    },
    clearDataId: (state) => {
      state.dataId = null;
    },
  },
});

export const { addWorkflow, removeWorkflow, removeAllWorkflows, updateWorkflow, setWorkflows, setDataId, clearDataId } = workflowSlice.actions;
export default workflowSlice.reducer;