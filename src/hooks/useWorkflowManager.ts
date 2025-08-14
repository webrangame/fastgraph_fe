'use client';

import { useState } from 'react';
import { Workflow, WorkflowNode, Connection } from '@/types/workflow';
import { initialWorkflows } from '@/lib/constants';
import {
  createNewWorkflowData,
  updateWorkflowStatus,
  addNodeToWorkflowData
} from '@/lib/workflow-utils';

export function useWorkflowManager() {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>('1');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  const currentWorkflow = workflows.find((w: Workflow) => w.id === activeWorkflow);

  const createNewWorkflow = () => {
    if (workflows.length >= 5) {
      alert('Maximum 5 workflows allowed');
      return;
    }
    
    const newWorkflow = createNewWorkflowData(workflows.length + 1);
    setWorkflows([...workflows, newWorkflow]);
    setActiveWorkflow(newWorkflow.id);
  };
  
  const closeWorkflow = (workflowId: string) => {
    const updatedWorkflows = workflows.filter((w: Workflow) => w.id !== workflowId);
    setWorkflows(updatedWorkflows);
    
    if (activeWorkflow === workflowId) {
      setActiveWorkflow(updatedWorkflows[0]?.id || null);
    }
  };

  const addNodeToWorkflow = (nodeData: any, position: { x: number; y: number }) => {
    if (!activeWorkflow) return;
    
    setWorkflows(workflows.map((w: Workflow) =>
      w.id === activeWorkflow
        ? addNodeToWorkflowData(w, nodeData, position)
        : w
    ));
  };

  const deleteNode = (nodeId: string) => {
    setWorkflows(workflows.map((w: Workflow) => {
      if (w.id === activeWorkflow) {
        return {
          ...w,
          nodes: w.nodes.filter((n: WorkflowNode) => n.id !== nodeId),
          connections: w.connections.filter((c: Connection) =>
            c.from !== nodeId && c.to !== nodeId
          )
        };
      }
      return w;
    }));
    setSelectedNode(null);
  };

  const executeWorkflow = () => {
    if (!currentWorkflow) return;
    
    setIsRunning(true);
    setWorkflows(workflows.map((w: Workflow) =>
      w.id === activeWorkflow
        ? updateWorkflowStatus(w, 'running')
        : w
    ));
    
    setTimeout(() => {
      setIsRunning(false);
      setWorkflows(workflows.map((w: Workflow) =>
        w.id === activeWorkflow
          ? updateWorkflowStatus(w, 'active', 'Just now')
          : w
      ));
    }, 3000);
  };

  const stopWorkflow = () => {
    setIsRunning(false);
    setWorkflows(workflows.map((w: Workflow) =>
      w.id === activeWorkflow
        ? updateWorkflowStatus(w, 'stopped', 'Just now')
        : w
    ));
  };

  const deleteWorkflow = () => {
    if (!currentWorkflow) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${currentWorkflow.name}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;
    
    const updatedWorkflows = workflows.filter((w: Workflow) => w.id !== activeWorkflow);
    setWorkflows(updatedWorkflows);
    setActiveWorkflow(updatedWorkflows[0]?.id || null);
    setSelectedNode(null);
  };

  return {
    workflows,
    activeWorkflow,
    currentWorkflow,
    selectedNode,
    isRunning,
    setActiveWorkflow,
    setSelectedNode,
    createNewWorkflow,
    closeWorkflow,
    deleteWorkflow,
    executeWorkflow,
    stopWorkflow,
    addNodeToWorkflow,
    deleteNode
  };
}