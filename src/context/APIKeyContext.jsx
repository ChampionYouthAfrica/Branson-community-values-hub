import { createContext, useContext, useState } from 'react';

const APIKeyContext = createContext();

// Calls are proxied through /api/claude — the real key lives server-side in
// Vercel env vars. This placeholder just satisfies legacy "is a key set" checks.
const DEFAULT_KEY = 'server-managed';

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
