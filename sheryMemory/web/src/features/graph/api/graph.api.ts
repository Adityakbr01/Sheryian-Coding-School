import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = Cookies.get('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const graphApi = {
  getGraph: async (): Promise<{ nodes: any[], links: any[] }> => {
    const response = await fetch(`${API_URL}/graph`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch knowledge graph network');
    const json = await response.json();
    return json.data;
  },
  syncGraph: async (): Promise<void> => {
    const response = await fetch(`${API_URL}/graph/sync`, { method: 'POST', headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to execute Vector Correlation sync');
  }
};
