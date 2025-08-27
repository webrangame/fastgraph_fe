'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Plus, Trash2, Key, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface APIKey {
  id: string;
  name: string;
  key: string;
  lastUsed: string;
  created: string;
}

export default function APIKeysSettings() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk-1234567890abcdef1234567890abcdef',
      lastUsed: '2 hours ago',
      created: 'Jan 15, 2024'
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'sk-abcdef1234567890abcdef1234567890',
      lastUsed: '1 day ago',
      created: 'Jan 10, 2024'
    }
  ]);
  
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKeys, setCopiedKeys] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = async (key: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(key);
      const newCopied = new Set(copiedKeys);
      newCopied.add(keyId);
      setCopiedKeys(newCopied);
      
      setTimeout(() => {
        setCopiedKeys(prev => {
          const updated = new Set(prev);
          updated.delete(keyId);
          return updated;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const deleteApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
  };

  const createApiKey = () => {
    if (!newKeyName.trim()) return;
    
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: newKeyName.trim(),
      key: `sk-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      lastUsed: 'Never',
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    
    setApiKeys(prev => [...prev, newKey]);
    setNewKeyName('');
    setShowCreateForm(false);
  };

  const maskKey = (key: string) => {
    return `${key.substring(0, 7)}${'*'.repeat(20)}${key.substring(key.length - 4)}`;
  };

  return (
    <div className="theme-card-bg rounded-lg theme-border border theme-shadow">
      <div className="p-6 theme-border border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold theme-text-primary flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Keys
            </h2>
            <p className="theme-text-secondary mt-1">
              Manage your API keys for secure access to your agents and workflows
            </p>
          </div>
          <Button 
            variant="primary" 
            className="flex items-center gap-2"
            onClick={() => setShowCreateForm(true)}
          >
            Create New Key
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Security Notice */}
        <div className="relative bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4 mb-6 hover:bg-blue-100 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Security Best Practice</h3>
              <p className="text-blue-700 text-sm mt-1">
                Keep your API keys private and rotate them regularly for maximum security.
              </p>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Create New Key Form */}
        {showCreateForm && (
          <div className="theme-input-bg rounded-lg p-4 mb-6 theme-border border">
            <h3 className="font-semibold theme-text-primary mb-3">Create New API Key</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter key name (e.g., Production API Key)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 theme-input-bg theme-border border rounded-lg px-3 py-2 theme-text-primary"
                onKeyPress={(e) => e.key === 'Enter' && createApiKey()}
              />
              <Button variant="primary" onClick={createApiKey} disabled={!newKeyName.trim()}>
                Create
              </Button>
              <Button variant="secondary" onClick={() => {
                setShowCreateForm(false);
                setNewKeyName('');
              }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* API Keys List */}
        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-12 h-12 theme-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold theme-text-primary mb-2">No API Keys</h3>
              <p className="theme-text-secondary mb-4">Create your first API key to get started</p>
              <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                Create API Key
              </Button>
            </div>
          ) : (
            apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="theme-input-bg rounded-lg p-4 theme-border border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold theme-text-primary">{apiKey.name}</h3>
                    <div className="flex items-center gap-4 text-sm theme-text-secondary mt-1">
                      <span>Created: {apiKey.created}</span>
                      <span>Last used: {apiKey.lastUsed}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteApiKey(apiKey.id)}
                    className="text-red-600 hover:text-red-700 transition-colors p-1"
                    title="Delete API key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 theme-card-bg rounded-lg p-3 font-mono text-sm theme-text-primary">
                    {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                  </div>
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    className="theme-hover-bg p-2 rounded-lg transition-colors"
                    title={visibleKeys.has(apiKey.id) ? 'Hide key' : 'Show key'}
                  >
                    {visibleKeys.has(apiKey.id) ? (
                      <EyeOff className="w-4 h-4 theme-text-secondary" />
                    ) : (
                      <Eye className="w-4 h-4 theme-text-secondary" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                    className="theme-hover-bg p-2 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedKeys.has(apiKey.id) ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 theme-text-secondary" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}