import { useState, useEffect } from 'react';

export interface ApiKeys {
  githubToken: string;
  googleApiKey: string;
  googleSearchEngineId: string;
}

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    githubToken: '',
    googleApiKey: '',
    googleSearchEngineId: ''
  });

  useEffect(() => {
    // Load API keys from session storage
    const savedKeys = sessionStorage.getItem('apiKeys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
  }, []);

  const updateApiKeys = (newKeys: Partial<ApiKeys>) => {
    const updatedKeys = { ...apiKeys, ...newKeys };
    setApiKeys(updatedKeys);
    sessionStorage.setItem('apiKeys', JSON.stringify(updatedKeys));
  };

  const clearApiKeys = () => {
    setApiKeys({
      githubToken: '',
      googleApiKey: '',
      googleSearchEngineId: ''
    });
    sessionStorage.removeItem('apiKeys');
  };

  const hasValidKeys = () => {
    return apiKeys.githubToken && apiKeys.googleApiKey && apiKeys.googleSearchEngineId;
  };

  return {
    apiKeys,
    updateApiKeys,
    clearApiKeys,
    hasValidKeys
  };
};