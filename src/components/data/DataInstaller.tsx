'use client';

import { useState } from 'react';
import { useInstallDataMutation } from '../../../redux/api/autoOrchestrate/autoOrchestrateApi';
import toast from 'react-hot-toast';

interface DataInstallerProps {
  onSuccess?: () => void;
}

export default function DataInstaller({ onSuccess }: DataInstallerProps) {
  const [dataName, setDataName] = useState('User Configuration Data');
  const [description, setDescription] = useState('Configuration data for user preferences and settings');
  const [dataType, setDataType] = useState('json');
  const [overwrite, setOverwrite] = useState(false);
  const [dataContent, setDataContent] = useState(JSON.stringify({
    users: [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com"
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com"
      }
    ],
    settings: {
      theme: "dark",
      language: "en"
    }
  }, null, 2));

  const [installData, { isLoading }] = useInstallDataMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Parse the JSON content
      const parsedDataContent = JSON.parse(dataContent);
      
      const result = await installData({
        dataName,
        description,
        dataType,
        dataContent: parsedDataContent,
        overwrite
      }).unwrap();

      toast.success('Data installed successfully!');
      onSuccess?.();
      
      console.log('Install result:', result);
    } catch (error: any) {
      console.error('Failed to install data:', error);
      toast.error(`Failed to install data: ${error.message || 'Unknown error'}`);
    }
  };

  const handleReset = () => {
    setDataName('User Configuration Data');
    setDescription('Configuration data for user preferences and settings');
    setDataType('json');
    setOverwrite(false);
    setDataContent(JSON.stringify({
      users: [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com"
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com"
        }
      ],
      settings: {
        theme: "dark",
        language: "en"
      }
    }, null, 2));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Install Data</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Name
          </label>
          <input
            type="text"
            value={dataName}
            onChange={(e) => setDataName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Type
          </label>
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="xml">XML</option>
            <option value="yaml">YAML</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Content (JSON)
          </label>
          <textarea
            value={dataContent}
            onChange={(e) => setDataContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            rows={15}
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="overwrite"
            checked={overwrite}
            onChange={(e) => setOverwrite(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="overwrite" className="ml-2 block text-sm text-gray-700">
            Overwrite existing data
          </label>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {isLoading ? 'Installing...' : 'Install Data'}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
