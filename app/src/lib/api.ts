const BASE_URL = import.meta.env.VITE_API_URL || 'https://englightededu.onrender.com/api';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 409) {
    const data = await res.json();
    throw Object.assign(new Error(data.message || 'Duplicate'), { code: 'duplicate', existing: data.existing });
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function requestWithMeta(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  const total = res.headers.get('X-Total-Count');
  return { data, total: total ? parseInt(total) : data.length };
}

export const api = {
  // Contacts
  getContacts: (limit = 50, offset = 0) => requestWithMeta(`/contacts/?limit=${limit}&offset=${offset}`),
  createContact: (data: any) => request('/contacts/', { method: 'POST', body: JSON.stringify(data) }),
  updateContact: (id: string, data: any) => request(`/contacts/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteContact: (id: string) => request(`/contacts/${id}/`, { method: 'DELETE' }),

  // Campaigns
  getCampaigns: () => request('/campaigns/'),
  createCampaign: (data: any) => request('/campaigns/', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id: string, data: any) => request(`/campaigns/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCampaign: (id: string) => request(`/campaigns/${id}/`, { method: 'DELETE' }),

  // Tasks
  getTasks: () => request('/tasks/'),
  createTask: (data: any) => request('/tasks/', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) => request(`/tasks/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request(`/tasks/${id}/`, { method: 'DELETE' }),

  // Automations
  getAutomations: () => request('/automations/'),
  createAutomation: (data: any) => request('/automations/', { method: 'POST', body: JSON.stringify(data) }),
  updateAutomation: (id: string, data: any) => request(`/automations/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAutomation: (id: string) => request(`/automations/${id}/`, { method: 'DELETE' }),

  // Messages
  getMessages: (contactId: string) => request(`/messages/${contactId}/`),
  sendMessage: (contactId: string, data: any) => request(`/messages/${contactId}/`, { method: 'POST', body: JSON.stringify(data) }),

  // WhatsApp
  whatsappSend: (contactId: string, message: string) => request('/whatsapp/send/', { method: 'POST', body: JSON.stringify({ contactId, message }) }),
  whatsappSendTemplate: (contactId: string) => request('/whatsapp/send-template/', { method: 'POST', body: JSON.stringify({ contactId, templateName: 'enlighted_admission_enquiry', lang: 'en' }) }),
  whatsappBulkSend: (message: string, tag?: string, contactIds?: string[]) => request('/whatsapp/bulk-send/', { method: 'POST', body: JSON.stringify({ message, tag, contactIds }) }),
};
