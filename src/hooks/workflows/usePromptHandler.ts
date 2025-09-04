'use client';

import { useState } from 'react';
import { Workflow, PromptMessage } from '@/types/workflow';

interface UsePromptHandlerProps {
  currentWorkflow: Workflow | undefined;
  selectedNode: string | null;
  addNodeToWorkflow: (nodeData: any, position: { x: number; y: number }) => void;
  deleteNode: (nodeId: string) => void;
  executeWorkflow: () => void;
}

export function usePromptHandler({
  currentWorkflow,
  selectedNode,
  addNodeToWorkflow,
  deleteNode,
  executeWorkflow
}: UsePromptHandlerProps) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [messages, setMessages] = useState<PromptMessage[]>([]);
  
  const handlePromptSubmit = async (message: string) => {
    setIsProcessing(true);
    
    // Add user message to chat
    const userMessage: PromptMessage = {
      id: `msg_${Date.now()}`,
      text: message,
      timestamp: new Date().toLocaleTimeString(),
      type: 'user'
    };
    setMessages(prev => [...prev, userMessage]);

    // Process the command based on message content
    let responseText = '';
    
    if (message.toLowerCase().includes('auto') || message.toLowerCase().includes('orchestrate')) {
      // Auto-orchestration is now handled automatically by useAutoOrchestrate hook
      responseText = 'Auto-orchestration is running automatically when workflows are available. Check the workflow canvas for results.';
    } else if (message.toLowerCase().includes('add') && message.toLowerCase().includes('agent')) {
      // Add a random agent to the workflow
      const agents = ['Customer Service Agent', 'Billing Agent', 'Technical Support Agent'];
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
      const randomIndex = Math.floor(Math.random() * agents.length);
      
      addNodeToWorkflow(
        {
          type: 'agent',
          name: agents[randomIndex],
          color: colors[randomIndex]
        },
        { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 }
      );
      
      responseText = `Added ${agents[randomIndex]} to your workflow!`;
    } else if (message.toLowerCase().includes('execute') || message.toLowerCase().includes('run')) {
      if (currentWorkflow && currentWorkflow.nodes.length > 0) {
        executeWorkflow();
        responseText = 'Executing your workflow now...';
      } else {
        responseText = 'Please add some agents to your workflow before executing.';
      }
    } else if (message.toLowerCase().includes('stats') || message.toLowerCase().includes('statistics')) {
      const nodeCount = currentWorkflow?.nodes.length || 0;
      const connectionCount = currentWorkflow?.connections.length || 0;
      responseText = `Current workflow has ${nodeCount} agents and ${connectionCount} connections. Status: ${currentWorkflow?.status || 'Unknown'}`;
    } else if (message.toLowerCase().includes('delete') || message.toLowerCase().includes('remove')) {
      if (selectedNode) {
        deleteNode(selectedNode);
        responseText = 'Removed the selected agent from your workflow.';
      } else {
        responseText = 'Please select an agent first to remove it.';
      }
    } else {
      responseText = 'I can help you add agents, execute workflows, show statistics, or remove selected agents. Try commands like "Add a customer service agent", "Execute workflow", or "Auto-orchestrate a workflow for customer onboarding".';
    }

    // Add system response
    const systemMessage: PromptMessage = {
      id: `msg_${Date.now() + 1}`,
      text: responseText,
      timestamp: new Date().toLocaleTimeString(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
    
    setIsProcessing(false);
  };

  return {
    handlePromptSubmit,
    isProcessing,
    messages
  };
}