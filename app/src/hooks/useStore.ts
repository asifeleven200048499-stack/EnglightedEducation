import { useState, useCallback, useEffect } from 'react';
import type {
  Contact,
  ContactTag,
  LeadStatus,
  Campaign,
  Automation,
  Task,
  Message,
  Conversation,
  DashboardStats,
  ContactFilterOptions,
  PreUploadMetadata
} from '@/types';
import { api } from '@/lib/api';

export function useStore() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [contactsOffset, setContactsOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreContacts, setHasMoreContacts] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);

  const [currentUser] = useState({
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as const,
  });

  // Parse dates from API strings
  const parseContact = (c: any): Contact => ({
    ...c,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
    lastContactedAt: c.lastContactedAt ? new Date(c.lastContactedAt) : undefined,
    lastReplyAt: c.lastReplyAt ? new Date(c.lastReplyAt) : undefined,
    optedInAt: c.optedInAt ? new Date(c.optedInAt) : undefined,
    notes: c.notes || [],
    customFields: c.customFields || {},
  });

  const parseMessage = (m: any): Message => ({
    ...m,
    sentAt: new Date(m.sentAt),
    deliveredAt: m.deliveredAt ? new Date(m.deliveredAt) : undefined,
    readAt: m.readAt ? new Date(m.readAt) : undefined,
  });

  // Load all data on mount
  useEffect(() => {
    Promise.all([
      api.getContacts(50, 0),
      api.getCampaigns(),
      api.getTasks(),
      api.getAutomations(),
    ]).then(([c, camp, t, a]) => {
      setContacts(c.data.map(parseContact));
      setTotalContacts(c.total);
      setContactsOffset(50);
      setHasMoreContacts(c.data.length === 50);
      setCampaigns(camp);
      setTasks(t);
      setAutomations(a);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadMoreContacts = useCallback(async () => {
    if (loadingMore || !hasMoreContacts) return;
    setLoadingMore(true);
    try {
      const c = await api.getContacts(50, contactsOffset);
      setContacts(prev => [...prev, ...c.data.map(parseContact)]);
      setContactsOffset(prev => prev + 50);
      setHasMoreContacts(c.data.length === 50);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMoreContacts, contactsOffset]);

  // Load messages for a contact when needed
  const loadMessages = useCallback(async (contactId: string) => {
    const msgs = await api.getMessages(contactId);
    setMessages(prev => ({ ...prev, [contactId]: msgs.map(parseMessage) }));
  }, []);

  const setMessagesForContact = useCallback((contactId: string, msgs: any[]) => {
    setMessages(prev => ({ ...prev, [contactId]: msgs.map(parseMessage) }));
  }, []);

  // No background polling - contacts update instantly when added/modified

  // ── Contact Actions ──────────────────────────────────────────────────────

  const addContact = useCallback(async (contactData: Partial<Contact>, metadata?: PreUploadMetadata) => {
    const newContact = await api.createContact({
      ...contactData,
      course: metadata?.course || contactData.course,
      school: metadata?.school || contactData.school,
      source: metadata?.source || contactData.source || 'Manual Entry',
      status: metadata?.defaultStatus || 'new',
      tags: metadata?.tags || contactData.tags || [],
      leadScore: contactData.leadScore || 50,
    });
    setContacts(prev => [parseContact(newContact), ...prev]);
    setTotalContacts(prev => prev + 1);
    return newContact;
  }, []);

  const addContacts = useCallback(async (contactsData: Partial<Contact>[], metadata?: PreUploadMetadata) => {
    const created: Contact[] = [];
    let duplicates = 0;
    await Promise.all(contactsData.map(async data => {
      try {
        const c = await api.createContact({
          ...data,
          course: metadata?.course || data.course,
          school: metadata?.school || data.school,
          source: metadata?.source || data.source || 'Bulk Import',
          status: metadata?.defaultStatus || 'new',
          tags: metadata?.tags || data.tags || [],
          leadScore: data.leadScore || 50,
        });
        created.push(parseContact(c));
      } catch (e: any) {
        if (e.code === 'duplicate') duplicates++;
        else throw e;
      }
    }));
    if (created.length > 0) {
      setContacts(prev => [...created, ...prev]);
      setTotalContacts(prev => prev + created.length);
    }
    return { created: created.length, duplicates };
  }, []);

  const updateContact = useCallback(async (id: string, updates: Partial<Contact>) => {
    const updated = await api.updateContact(id, updates);
    setContacts(prev => prev.map(c => c.id === id ? parseContact(updated) : c));
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    await api.deleteContact(id);
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  const addTagToContact = useCallback(async (contactId: string, tag: ContactTag) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact || contact.tags.includes(tag)) return;
    await updateContact(contactId, { tags: [...contact.tags, tag] });
  }, [contacts, updateContact]);

  const removeTagFromContact = useCallback(async (contactId: string, tag: ContactTag) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    await updateContact(contactId, { tags: contact.tags.filter(t => t !== tag) });
  }, [contacts, updateContact]);

  const addNote = useCallback(async (contactId: string, content: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    const note = { id: crypto.randomUUID(), contactId, content, createdBy: currentUser.id, createdAt: new Date() };
    await updateContact(contactId, { notes: [note, ...contact.notes] });
  }, [contacts, currentUser.id, updateContact]);

  // ── Filter Contacts ──────────────────────────────────────────────────────

  const filterContacts = useCallback((options: ContactFilterOptions): Contact[] => {
    return contacts.filter(contact => {
      if (options.search) {
        const s = options.search.toLowerCase();
        if (!contact.name.toLowerCase().includes(s) && !contact.phone.includes(s) && !contact.email?.toLowerCase().includes(s)) return false;
      }
      if (options.status?.length && !options.status.includes(contact.status)) return false;
      if (options.tags?.length && !options.tags.some(t => contact.tags.includes(t))) return false;
      if (options.course?.length && !options.course.includes(contact.course || '')) return false;
      if (options.school?.length && !options.school.includes(contact.school || '')) return false;
      if (options.source?.length && !options.source.includes(contact.source || '')) return false;
      if (options.leadScoreMin !== undefined && contact.leadScore < options.leadScoreMin) return false;
      if (options.leadScoreMax !== undefined && contact.leadScore > options.leadScoreMax) return false;
      return true;
    });
  }, [contacts]);

  // ── Campaign Actions ─────────────────────────────────────────────────────

  const createCampaign = useCallback(async (data: Partial<Campaign>) => {
    const created = await api.createCampaign({ ...data, createdBy: currentUser.id });
    setCampaigns(prev => [created, ...prev]);
    return created;
  }, [currentUser.id]);

  const updateCampaign = useCallback(async (id: string, updates: Partial<Campaign>) => {
    const updated = await api.updateCampaign(id, updates);
    setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
  }, []);

  const deleteCampaign = useCallback(async (id: string) => {
    await api.deleteCampaign(id);
    setCampaigns(prev => prev.filter(c => c.id !== id));
  }, []);

  // ── Automation Actions ───────────────────────────────────────────────────

  const createAutomation = useCallback(async (data: Partial<Automation>) => {
    const created = await api.createAutomation(data);
    setAutomations(prev => [created, ...prev]);
    return created;
  }, []);

  const updateAutomation = useCallback(async (id: string, updates: Partial<Automation>) => {
    const updated = await api.updateAutomation(id, updates);
    setAutomations(prev => prev.map(a => a.id === id ? updated : a));
  }, []);

  const deleteAutomation = useCallback(async (id: string) => {
    await api.deleteAutomation(id);
    setAutomations(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggleAutomation = useCallback(async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;
    await updateAutomation(id, { isActive: !automation.isActive });
  }, [automations, updateAutomation]);

  // ── Task Actions ─────────────────────────────────────────────────────────

  const createTask = useCallback(async (data: Partial<Task>) => {
    const created = await api.createTask({ ...data, assignedTo: data.assignedTo || currentUser.id, assignedBy: currentUser.id });
    setTasks(prev => [created, ...prev]);
    return created;
  }, [currentUser.id]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const updated = await api.updateTask(id, updates);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
  }, []);

  const completeTask = useCallback(async (id: string) => {
    await updateTask(id, { status: 'completed' });
  }, [updateTask]);

  const deleteTask = useCallback(async (id: string) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Message Actions ──────────────────────────────────────────────────────

  const sendMessage = useCallback(async (contactId: string, content: string, isAutomated = false) => {
    await loadMessages(contactId);
    const msg = await api.sendMessage(contactId, { content, direction: 'outbound', status: 'sent', isAutomated });
    const parsed = parseMessage(msg);
    setMessages(prev => ({ ...prev, [contactId]: [...(prev[contactId] || []), parsed] }));
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, lastContactedAt: new Date(), messageCount: c.messageCount + 1 } : c));
    return parsed;
  }, [loadMessages]);

  const receiveMessage = useCallback(async (contactId: string, content: string) => {
    const msg = await api.sendMessage(contactId, { content, direction: 'inbound', status: 'read', isAutomated: false });
    const parsed = parseMessage(msg);
    setMessages(prev => ({ ...prev, [contactId]: [...(prev[contactId] || []), parsed] }));
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, lastReplyAt: new Date(), replyCount: c.replyCount + 1 } : c));
    return parsed;
  }, []);

  const getConversation = useCallback((contactId: string): Conversation | undefined => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return undefined;
    const contactMessages = messages[contactId] || [];
    return {
      contactId,
      contact,
      messages: contactMessages,
      unreadCount: contactMessages.filter(m => m.direction === 'inbound' && m.status !== 'read').length,
      lastMessage: contactMessages[contactMessages.length - 1],
    };
  }, [contacts, messages]);

  const getAllConversations = useCallback((): Conversation[] => {
    return contacts
      .filter(c => c.replyCount > 0 || c.messageCount > 0 || messages[c.id]?.length > 0)
      .map(c => ({
        contactId: c.id,
        contact: c,
        messages: messages[c.id] || [],
        unreadCount: (messages[c.id] || []).filter(m => m.direction === 'inbound' && m.status !== 'read').length,
        lastMessage: messages[c.id]?.[messages[c.id].length - 1],
      }))
      .sort((a, b) => {
        const aTime = a.lastMessage?.sentAt.getTime() || a.contact.lastReplyAt?.getTime() || a.contact.lastContactedAt?.getTime() || 0;
        const bTime = b.lastMessage?.sentAt.getTime() || b.contact.lastReplyAt?.getTime() || b.contact.lastContactedAt?.getTime() || 0;
        return bTime - aTime;
      });
  }, [contacts, messages]);

  // ── Export/Import ────────────────────────────────────────────────────────

  const exportContactsToCSV = useCallback((contactIds?: string[]): string => {
    const list = contactIds ? contacts.filter(c => contactIds.includes(c.id)) : contacts;
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Course', 'School', 'Source', 'Status', 'Tags', 'Lead Score', 'Created At'];
    const rows = list.map(c => [c.id, c.name, c.phone, c.email || '', c.course || '', c.school || '', c.source || '', c.status, c.tags.join(', '), c.leadScore, c.createdAt.toISOString()]);
    return [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
  }, [contacts]);

  const importContactsFromCSV = useCallback(async (csvData: string, metadata?: PreUploadMetadata) => {
    const lines = csvData.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const imported: Contact[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => row[h] = values[idx] || '');
      if (!row.Name || !row.Phone) continue;
      const c = await api.createContact({
        name: row.Name, phone: row.Phone, email: row.Email,
        course: metadata?.course || row.Course,
        school: metadata?.school || row.School,
        source: metadata?.source || row.Source || 'CSV Import',
        status: row.Status || 'new',
        tags: row.Tags ? row.Tags.split(',').map(t => t.trim()) : [],
        leadScore: parseInt(row['Lead Score']) || 50,
      });
      imported.push(parseContact(c));
    }
    setContacts(prev => [...imported, ...prev]);
    return { imported, errors: [], count: imported.length };
  }, []);

  // ── Dashboard Stats ──────────────────────────────────────────────────────

  const getDashboardStats = useCallback((): DashboardStats => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const pipelineDistribution: Record<LeadStatus, number> = { new: 0, contacted: 0, interested: 0, converted: 0, lost: 0 };
    contacts.forEach(c => pipelineDistribution[c.status]++);
    return {
      totalContacts: totalContacts,
      newContactsToday: contacts.filter(c => c.createdAt >= today).length,
      activeLeads: contacts.filter(c => c.status === 'interested').length,
      conversionRate: contacts.length > 0 ? Math.round((contacts.filter(c => c.status === 'converted').length / contacts.length) * 100) : 0,
      messagesSentToday: 0,
      messagesReceivedToday: 0,
      replyRate: 0,
      activeCampaigns: campaigns.filter(c => c.status === 'running').length,
      campaignPerformance: campaigns.map(c => ({ name: c.name, sent: c.sentCount, delivered: c.deliveredCount, read: c.readCount, replied: c.repliedCount })),
      pipelineDistribution,
      leadScoreDistribution: [
        { range: '0-25', count: contacts.filter(c => c.leadScore <= 25).length },
        { range: '26-50', count: contacts.filter(c => c.leadScore > 25 && c.leadScore <= 50).length },
        { range: '51-75', count: contacts.filter(c => c.leadScore > 50 && c.leadScore <= 75).length },
        { range: '76-100', count: contacts.filter(c => c.leadScore > 75).length },
      ],
    };
  }, [contacts, campaigns]);

  const analyzeIntent = useCallback((message: string) => {
    const l = message.toLowerCase();
    if (l.includes('interested') || l.includes('yes') || l.includes('want')) return 'interested' as const;
    if (l.includes('not interested') || l.includes('no') || l.includes('stop')) return 'not-interested' as const;
    if (l.includes('urgent') || l.includes('asap')) return 'urgent' as const;
    return 'neutral' as const;
  }, []);

  const calculateLeadScore = useCallback((contact: Contact): number => {
    let score = 50;
    if (contact.status === 'converted') score += 30;
    else if (contact.status === 'interested') score += 20;
    else if (contact.status === 'lost') score -= 20;
    if (contact.replyCount > 10) score += 15;
    else if (contact.replyCount > 5) score += 10;
    else if (contact.replyCount > 0) score += 5;
    if (contact.tags.includes('hot')) score += 10;
    if (contact.tags.includes('not-interested')) score -= 15;
    return Math.max(0, Math.min(100, score));
  }, []);

  return {
    contacts, totalContacts, loadingMore, hasMoreContacts, campaigns, automations, tasks, messages, loading,
    currentUser, segments: [],
    notifications: [],
    addContact, addContacts, updateContact, deleteContact,
    addTagToContact, removeTagFromContact, addNote, filterContacts,
    loadMoreContacts,
    createCampaign, updateCampaign, deleteCampaign,
    createAutomation, updateAutomation, deleteAutomation, toggleAutomation,
    createTask, updateTask, completeTask, deleteTask,
    sendMessage, receiveMessage, getConversation, getAllConversations,
    loadMessages, setMessagesForContact,
    exportContactsToCSV, importContactsFromCSV,
    getDashboardStats, analyzeIntent, calculateLeadScore,
  };
}
