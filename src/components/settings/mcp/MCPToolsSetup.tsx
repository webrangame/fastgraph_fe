'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useCreateMCPServerMutation, useGetMCPServersByStatusQuery } from '@/redux/api/mcp/mcpApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slice/authSlice';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Loader2 } from 'lucide-react';

interface MCPConfig {
  serverName: string;
  serverId: string;
  serverType: string;
  serverUrl: string;
  authType: string;
  apiKey: string;
  timeout: number;
  retries: number;
  configYml?: string;
}

interface MCPToolsSetupProps {
  config: MCPConfig;
  onNavigateToAvailableMCPs?: () => void;
}

export default function MCPToolsSetup({ 
  config,
  onNavigateToAvailableMCPs
}: MCPToolsSetupProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [yamlContent, setYamlContent] = useState<string>(config?.configYml || '');
  const [yamlErrors, setYamlErrors] = useState<string[]>([]);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [hasLoadedFromAPI, setHasLoadedFromAPI] = useState(false);
  
  const [createMCPServer, { isLoading: isCreating }] = useCreateMCPServerMutation();
  const { data: savedConfigs, isLoading: isLoadingConfigs, refetch: refetchConfigs } = useGetMCPServersByStatusQuery('active');
  const user = useSelector(selectCurrentUser);

  // Keep Monaco theme in sync with app theme
  useEffect(() => {
    const compute = () => {
      try {
        const isDark = document.documentElement.classList.contains('dark');
        setEditorTheme(isDark ? 'vs-dark' : 'light');
        return;
      } catch {}
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setEditorTheme(mq.matches ? 'vs-dark' : 'light');
    };
    compute();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => compute();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Validate YAML (basic presence checks)
  const validateYaml = (content: string) => {
    const errors: string[] = [];
    if (content && content.trim()) {
      const hasColon = content.includes(':');
      const hasDash = content.split('\n').some((l) => l.trim().startsWith('-'));
      if (!hasColon && !hasDash) {
        errors.push('YAML appears invalid: missing key-value (:) or list (-) structure');
      }
    }
    setYamlErrors(errors);
    return errors.length === 0;
  };

  const handleYamlChange = (value?: string) => {
    const newVal = value ?? '';
    setYamlContent(newVal);
    validateYaml(newVal);
  };

  const handleYamlMount = (ed: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = ed;
    setTimeout(() => {
      const model = ed.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, 'yaml');
      }
      ed.updateOptions({});
    }, 50);
  };

  const handleYamlSaveToForm = async () => {
    if (!validateYaml(yamlContent)) {
      toast.error('Please fix YAML errors before saving');
      return;
    }

    try {
      // Create MCP server with YAML content
      toast.loading('Creating MCP server from YAML...', { id: 'yaml-create' });
      
      const createResult = await createMCPServer({
        yamlContent: yamlContent,
        status: 'active',
        createdBy: user?.id || user?.userId || 'unknown-user'
      }).unwrap();

      toast.success('MCP server created successfully from YAML!', { id: 'yaml-create' });
      
      // Navigate to Available MCPs section after successful save
      if (onNavigateToAvailableMCPs) {
        setTimeout(() => {
          onNavigateToAvailableMCPs();
        }, 1500);
      }
      
    } catch (error: any) {
      console.error('MCP server creation from YAML failed:', error);
      
      toast.error(
        error?.data?.message || 
        error?.message || 
        'Failed to create MCP server from YAML. Please check your configuration.',
        { id: 'yaml-create' }
      );
    }
  };

  const handleYamlReset = () => {
    const savedYaml = config?.configYml || '';
    setYamlContent(savedYaml);
    setYamlErrors([]);
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) model.setValue(savedYaml);
    }
  };

  // Auto-load saved configuration from API
  useEffect(() => {
    if (savedConfigs && savedConfigs.length > 0 && !hasLoadedFromAPI && !isLoadingConfigs) {
      const savedConfig = savedConfigs[0]; // Get the first/only saved configuration
      if (savedConfig && savedConfig.yamlContent) {
        setYamlContent(savedConfig.yamlContent);
        setYamlErrors([]);
        setHasLoadedFromAPI(true);
        
        // Update the editor if it exists
        if (editorRef.current) {
          const model = editorRef.current.getModel();
          if (model) model.setValue(savedConfig.yamlContent);
        }
      }
    }
  }, [savedConfigs, hasLoadedFromAPI, isLoadingConfigs]);

  // Refetch configs when a new one is created
  useEffect(() => {
    if (isCreating === false) {
      refetchConfigs();
      setHasLoadedFromAPI(false); // Reset to allow re-loading
    }
  }, [isCreating, refetchConfigs]);


  return (
    <div className="theme-card-bg rounded-sm p-6 theme-border border theme-shadow">
      <h3 className="text-xl font-semibold theme-text-primary mb-4">MCP Settings</h3>

      <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium theme-text-primary">Configuration YAML</h4>
              <p className="text-xs theme-text-secondary">Edit advanced MCP server settings using YAML</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleYamlReset}
                className="px-3 py-1.5 text-sm rounded-sm theme-hover-bg theme-text-primary"
              >
                Reset to saved
              </button>
              <button
                onClick={handleYamlSaveToForm}
                className="px-3 py-1.5 text-sm rounded-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                Save YAML
              </button>
            </div>
          </div>

          {/* Status indicator for loading saved configuration */}
          {isLoadingConfigs && (
            <div className="flex items-center gap-2 text-sm theme-text-secondary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading saved configuration...</span>
            </div>
          )}

          <div className="h-[420px] theme-border border rounded-sm overflow-hidden theme-bg">
            <Editor
              key="yaml-editor"
              height="100%"
              defaultLanguage="yaml"
              language="yaml"
              defaultValue={yamlContent}
              onChange={handleYamlChange}
              onMount={handleYamlMount}
              theme={editorTheme}
              options={{
                minimap: { enabled: true },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                wrappingStrategy: 'advanced',
                folding: true,
                foldingStrategy: 'indentation',
                showFoldingControls: 'always',
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                contextmenu: true,
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: 'on',
                formatOnPaste: true,
                formatOnType: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs theme-text-secondary">
            <div className="flex items-center gap-3">
              <span>Lines: {yamlContent.split('\n').length}</span>
              <span>•</span>
              <span>Characters: {yamlContent.length}</span>
            </div>
            {yamlErrors.length > 0 ? (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>{yamlErrors.length} error{yamlErrors.length > 1 ? 's' : ''}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Valid</span>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}