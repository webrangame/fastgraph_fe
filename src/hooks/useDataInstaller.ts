import { useState } from 'react';
import { useInstallDataMutation } from '../../redux/api/autoOrchestrate/autoOrchestrateApi';
import toast from 'react-hot-toast';

interface InstallDataParams {
  dataName: string;
  description: string;
  dataType?: string;
  dataContent: any;
  overwrite?: boolean;
}

export function useDataInstaller() {
  const [installData, { isLoading, error }] = useInstallDataMutation();
  const [isSuccess, setIsSuccess] = useState(false);

  const install = async (params: InstallDataParams) => {
    try {
      setIsSuccess(false);
      
      const result = await installData({
        dataName: params.dataName,
        description: params.description,
        dataType: params.dataType || 'json',
        dataContent: params.dataContent,
        overwrite: params.overwrite || false
      }).unwrap();

      setIsSuccess(true);
      toast.success('Data installed successfully!');
      
      return result;
    } catch (error: any) {
      console.error('Failed to install data:', error);
      toast.error(`Failed to install data: ${error.message || 'Unknown error'}`);
      throw error;
    }
  };

  const installUserConfig = async (users: any[], settings: any, overwrite = false) => {
    return install({
      dataName: 'User Configuration Data',
      description: 'Configuration data for user preferences and settings',
      dataType: 'json',
      dataContent: {
        users,
        settings
      },
      overwrite
    });
  };

  const installSampleData = async (overwrite = false) => {
    const sampleUsers = [
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
    ];

    const sampleSettings = {
      theme: "dark",
      language: "en"
    };

    return installUserConfig(sampleUsers, sampleSettings, overwrite);
  };

  return {
    install,
    installUserConfig,
    installSampleData,
    isLoading,
    error,
    isSuccess
  };
}
