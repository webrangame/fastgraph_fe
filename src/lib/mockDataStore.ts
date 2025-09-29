// Shared mock data store for API routes
export interface MockWorkflow {
  dataId: string;
  dataName: string;
  description: string;
  dataType: string;
  dataContent: {
    autoOrchestrateResult: {
      nodes: any[];
      connections: any[];
    };
  };
  status: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  installedAt: string;
  numberOfAgents?: number;
}

// Global mock data store
export let mockWorkflows: MockWorkflow[] = [
  {
    dataId: '1',
    dataName: 'Sample Workflow 1',
    description: 'A sample workflow for testing',
    dataType: 'json',
    dataContent: {
      autoOrchestrateResult: {
        nodes: [],
        connections: []
      }
    },
    status: 'active',
    createdBy: '1',
    updatedBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    installedAt: new Date().toISOString(),
    numberOfAgents: 0
  },
  {
    dataId: '2',
    dataName: 'Sample Workflow 2',
    description: 'Another sample workflow',
    dataType: 'json',
    dataContent: {
      autoOrchestrateResult: {
        nodes: [],
        connections: []
      }
    },
    status: 'active',
    createdBy: '1',
    updatedBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    installedAt: new Date().toISOString(),
    numberOfAgents: 0
  }
];

// Helper functions
export const getWorkflows = () => mockWorkflows;
export const getWorkflowById = (dataId: string) => mockWorkflows.find(w => w.dataId === dataId);
export const deleteWorkflow = (dataId: string) => {
  const index = mockWorkflows.findIndex(w => w.dataId === dataId);
  if (index !== -1) {
    return mockWorkflows.splice(index, 1)[0];
  }
  return null;
};
export const addWorkflow = (workflow: Omit<MockWorkflow, 'dataId' | 'createdAt' | 'updatedAt' | 'installedAt'>) => {
  const newWorkflow: MockWorkflow = {
    ...workflow,
    dataId: (mockWorkflows.length + 1).toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    installedAt: new Date().toISOString()
  };
  mockWorkflows.push(newWorkflow);
  return newWorkflow;
};
export const updateWorkflow = (dataId: string, updates: Partial<MockWorkflow>) => {
  const index = mockWorkflows.findIndex(w => w.dataId === dataId);
  if (index !== -1) {
    mockWorkflows[index] = { ...mockWorkflows[index], ...updates, updatedAt: new Date().toISOString() };
    return mockWorkflows[index];
  }
  return null;
};
