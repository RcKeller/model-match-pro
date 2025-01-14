import useSWR from 'swr';

import { useAuth } from '@/contexts/auth';
import { createContext, useContext, useState } from 'react';

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/model_match_app/`;

export const ModelsContext = createContext({
  models: [],
  selectedModels: [],
  error: null,
  loading: false,
  toggleModelActive: (modelCode: any) => modelCode,
});

export function useModels() {
  const context = useContext(ModelsContext);
  if (!context) {
    throw new Error('You forgot ModelsProvider!');
  }
  return context;
}

export default function ModelsProvider(props) {
  const { tokens } = useAuth();
  /**
   * Example Models:
   [{
        "id": 79,
        "name": "BLOOM",
        "api_code": "bigscience/bloom"
   }]
   */
  const { data = [], error } = useSWR([apiUrl, tokens], fetchModels);
  const [selectedModels, setSelectedModels] = useState([]);

  async function fetchModels() {
    try {
      if (!tokens) {
        throw new Error('No auth tokens found');
      }
      const response = await fetch(apiUrl, config());
      const responseJSON = await response.json();
      return responseJSON;
    } catch (err) {
      handleError(err);
    }
  }

  function handleError(err) {
    console.error(`fetchModels: ${err}`);
  }

  function config() {
    return {
      headers: {
        Authorization: 'Bearer ' + tokens.access,
        'Content-Type': 'application/json',
      },
    };
  }

  function toggleModelActive(modelCode) {
    setSelectedModels((prevSelected) =>
      prevSelected.some((m) => m === modelCode)
        ? prevSelected.filter((m) => m !== modelCode)
        : [...prevSelected, modelCode]
    );
  }

  return (
    <ModelsContext.Provider
      value={{
        models: data,
        selectedModels,
        error,
        loading: tokens && !error && !data,
        toggleModelActive,
      }}
    >
      {props.children}
    </ModelsContext.Provider>
  );
}
