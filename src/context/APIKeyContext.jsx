import { createContext, useContext, useState } from 'react';

const APIKeyContext = createContext();

const DEFAULT_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';

export function APIKeyProvider({ children }) {
  const [apiKey, setApiKey] = useState(DEFAULT_KEY);

  const clearApiKey = () => setApiKey('');

  return (
    <APIKeyContext.Provider value={{ apiKey, setApiKey, clearApiKey }}>
      {children}
    </APIKeyContext.Provider>
  );
}

export function useAPIKey() {
  return useContext(APIKeyContext);
}
