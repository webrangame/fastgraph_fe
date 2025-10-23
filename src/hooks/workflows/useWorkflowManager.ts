'use client';

import { useState } from 'react';
import { Workflow, WorkflowNode, Connection } from '@/types/workflow';
import { initialWorkflows } from '@/lib/constants';
import {
  createNewWorkflowData,
  updateWorkflowStatus,
  addNodeToWorkflowData
} from '@/lib/workflow-utils';
import { useAuditLog } from '@/hooks/useAuditLog';

export function useWorkflowManager() {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const { logWorkflowCreate, logWorkflowStart, logWorkflowEnd } = useAuditLog();
  
  const currentWorkflow = workflows.find((w: Workflow) => w.id === activeWorkflow);

  const createNewWorkflow = async () => {
    const newWorkflow = createNewWorkflowData(workflows.length + 1);
    setWorkflows([...workflows, newWorkflow]);
    setActiveWorkflow(newWorkflow.id);
    
    // Log workflow creation audit
    await logWorkflowCreate(newWorkflow);
  };
  
  const closeWorkflow = async (workflowId: string) => {
    const workflowToClose = workflows.find((w: Workflow) => w.id === workflowId);
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

  const executeWorkflow = async () => {
    if (!currentWorkflow) return;
    
    // Log workflow start
    await logWorkflowStart(currentWorkflow);
    
    setIsRunning(true);
    setWorkflows(workflows.map((w: Workflow) =>
      w.id === activeWorkflow
        ? updateWorkflowStatus(w, 'running')
        : w
    ));
    
    setTimeout(async () => {
      setIsRunning(false);
      const updatedWorkflow = updateWorkflowStatus(currentWorkflow, 'active', 'Just now');
      setWorkflows(workflows.map((w: Workflow) =>
        w.id === activeWorkflow ? updatedWorkflow : w
      ));
      
      // Log workflow completion
      await logWorkflowEnd(updatedWorkflow, 'completed');
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

  const deleteWorkflow = async () => {
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