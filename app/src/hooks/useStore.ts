import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { 
  Contact, 
  ContactTag, 
  LeadStatus, 
  Campaign, 
  Automation, 
  Task, 
  Segment,
  Message,
  Conversation,
  Note,
  DashboardStats,
  Notification,
  ContactFilterOptions,
  PreUploadMetadata
} from '@/types';

// ============================================
// Sample Data for Demo
// ============================================
const generateSampleContacts = (): Contact[] => [
  {
    id: 'test-user-1',
    name: 'Test User 1',
    phone: '+910000000001',
    email: 'testuser1@example.com',
    course: 'Science (PCM)',
    school: 'Test School 1',
    source: 'WhatsApp Group',
    status: 'interested',
    tags: ['hot', 'interested'],
    leadScore: 75,
    intent: 'interested',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    lastContactedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastReplyAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    messageCount: 4,
    replyCount: 2,
    hasOptedIn: true,
    optedInAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    notes: [],
    customFields: {}
  },
  {
    id: 'test-user-2',
    name: 'Test User 2',
    phone: '+910000000002',
    email: 'testuser2@example.com',
    course: 'Commerce (with Maths)',
    school: 'Test School 2',
    source: 'Referral',
    status: 'new',
    tags: ['warm'],
    leadScore: 50,
    intent: 'neutral',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    lastContactedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    lastReplyAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    messageCount: 2,
    replyCount: 1,
    hasOptedIn: true,
    optedInAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    notes: [],
    customFields: {}
  }
];

const generateSampleCampaigns = (): Campaign[] => [
  {
    id: uuidv4(),
    name: 'Test Campaign 1',
    description: 'Sample campaign for testing',
    messageTemplate: 'Hello {{name}}! This is a test campaign message.',
    targetTags: ['hot', 'warm'],
    targetSegments: [],
    status: 'draft',
    totalRecipients: 0,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    repliedCount: 0,
    failedCount: 0,
    abTestEnabled: false,
    createdBy: 'Admin',
    createdAt: new Date()
  }
];

const generateSampleAutomations = (): Automation[] => [];

const generateSampleTasks = (): Task[] => [];

const generateSampleMessages = (): Record<string, Message[]> => ({
  'test-user-1': [
    {
      id: uuidv4(),
      contactId: 'test-user-1',
      content: 'Hi, I am Test User 1. I wanted to ask about admissions.',
      direction: 'inbound',
      status: 'read',
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isAutomated: false
    },
    {
      id: uuidv4(),
      contactId: 'test-user-1',
      content: 'Hello Test User 1! Happy to help. What would you like to know?',
      direction: 'outbound',
      status: 'read',
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 300000),
      deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 310000),
      readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 320000),
      isAutomated: false
    },
    {
      id: uuidv4(),
      contactId: 'test-user-1',
      content: 'What are the available streams for 12th grade?',
      direction: 'inbound',
      status: 'read',
      sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isAutomated: false
    },
    {
      id: uuidv4(),
      contactId: 'test-user-1',
      content: 'We offer Science (PCM/PCB), Commerce, and Arts streams.',
      direction: 'outbound',
      status: 'delivered',
      sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 300000),
      deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 310000),
      isAutomated: false
    }
  ],
  'test-user-2': [
    {
      id: uuidv4(),
      contactId: 'test-user-2',
      content: 'Hello, I am Test User 2. Can you share more details?',
      direction: 'inbound',
      status: 'read',
      sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isAutomated: false
    },
    {
      id: uuidv4(),
      contactId: 'test-user-2',
      content: 'Hi Test User 2! Sure, what details are you looking for?',
      direction: 'outbound',
      status: 'delivered',
      sentAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 23 * 60 * 60 * 1000 + 10000),
      isAutomated: false
    }
  ]
});

// ============================================
// Main Store Hook
// ============================================
export function useStore() {
  // State
  const [contacts, setContacts] = useState<Contact[]>(generateSampleContacts());
  const [campaigns, setCampaigns] = useState<Campaign[]>(generateSampleCampaigns());
  const [automations, setAutomations] = useState<Automation[]>(generateSampleAutomations());
  const [tasks, setTasks] = useState<Task[]>(generateSampleTasks());
  const [segments, setSegments] = useState<Segment[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser] = useState({
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as const
  });

  // Initialize messages for sample contacts
  useEffect(() => {
    setMessages(generateSampleMessages());
  }, []);

  // ============================================
  // Contact Actions
  // ============================================
  const addContact = useCallback((contactData: Partial<Contact>, metadata?: PreUploadMetadata) => {
    const newContact: Contact = {
      id: uuidv4(),
      name: contactData.name || 'Unknown',
      phone: contactData.phone || '',
      email: contactData.email,
      course: metadata?.course || contactData.course,
      school: metadata?.school || contactData.school,
      source: metadata?.source || contactData.source || 'Manual',
      status: metadata?.defaultStatus || 'new',
      tags: metadata?.tags || contactData.tags || [],
      leadScore: contactData.leadScore || 50,
      intent: contactData.intent || 'neutral',
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      replyCount: 0,
      hasOptedIn: false,
      notes: [],
      customFields: contactData.customFields || {}
    };
    setContacts(prev => [newContact, ...prev]);
    return newContact;
  }, []);

  const addContacts = useCallback((contactsData: Partial<Contact>[], metadata?: PreUploadMetadata) => {
    const newContacts: Contact[] = contactsData.map(data => ({
      id: uuidv4(),
      name: data.name || 'Unknown',
      phone: data.phone || '',
      email: data.email,
      course: metadata?.course || data.course,
      school: metadata?.school || data.school,
      source: metadata?.source || data.source || 'Bulk Import',
      status: metadata?.defaultStatus || 'new',
      tags: metadata?.tags || data.tags || [],
      leadScore: data.leadScore || 50,
      intent: data.intent || 'neutral',
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      replyCount: 0,
      hasOptedIn: false,
      notes: [],
      customFields: data.customFields || {}
    }));
    setContacts(prev => [...newContacts, ...prev]);
    return newContacts;
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
    ));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  const addTagToContact = useCallback((contactId: string, tag: ContactTag) => {
    setContacts(prev => prev.map(c => 
      c.id === contactId && !c.tags.includes(tag)
        ? { ...c, tags: [...c.tags, tag], updatedAt: new Date() }
        : c
    ));
  }, []);

  const removeTagFromContact = useCallback((contactId: string, tag: ContactTag) => {
    setContacts(prev => prev.map(c => 
      c.id === contactId
        ? { ...c, tags: c.tags.filter(t => t !== tag), updatedAt: new Date() }
        : c
    ));
  }, []);

  const addNote = useCallback((contactId: string, content: string) => {
    const newNote: Note = {
      id: uuidv4(),
      contactId,
      content,
      createdBy: currentUser.id,
      createdAt: new Date()
    };
    setContacts(prev => prev.map(c => 
      c.id === contactId
        ? { ...c, notes: [newNote, ...c.notes], updatedAt: new Date() }
        : c
    ));
  }, [currentUser.id]);

  // ============================================
  // Filter Contacts
  // ============================================
  const filterContacts = useCallback((options: ContactFilterOptions): Contact[] => {
    return contacts.filter(contact => {
      // Search
      if (options.search) {
        const search = options.search.toLowerCase();
        const matchesSearch = 
          contact.name.toLowerCase().includes(search) ||
          contact.phone.includes(search) ||
          contact.email?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Status
      if (options.status?.length && !options.status.includes(contact.status)) return false;

      // Tags
      if (options.tags?.length && !options.tags.some(tag => contact.tags.includes(tag))) return false;

      // Course
      if (options.course?.length && !options.course.includes(contact.course || '')) return false;

      // School
      if (options.school?.length && !options.school.includes(contact.school || '')) return false;

      // Source
      if (options.source?.length && !options.source.includes(contact.source || '')) return false;

      // Lead Score
      if (options.leadScoreMin !== undefined && contact.leadScore < options.leadScoreMin) return false;
      if (options.leadScoreMax !== undefined && contact.leadScore > options.leadScoreMax) return false;

      // Date Range
      if (options.dateFrom && contact.createdAt < options.dateFrom) return false;
      if (options.dateTo && contact.createdAt > options.dateTo) return false;

      // Last Contacted
      if (options.lastContactedDays !== undefined) {
        const cutoff = new Date(Date.now() - options.lastContactedDays * 24 * 60 * 60 * 1000);
        if (contact.lastContactedAt && contact.lastContactedAt > cutoff) return false;
      }

      // Has Replied
      if (options.hasReplied !== undefined) {
        const hasReplied = contact.replyCount > 0;
        if (hasReplied !== options.hasReplied) return false;
      }

      // Intent
      if (options.intent?.length && !options.intent.includes(contact.intent || '')) return false;

      return true;
    });
  }, [contacts]);

  // ============================================
  // Campaign Actions
  // ============================================
  const createCampaign = useCallback((campaignData: Partial<Campaign>) => {
    const newCampaign: Campaign = {
      id: uuidv4(),
      name: campaignData.name || 'Untitled Campaign',
      description: campaignData.description,
      messageTemplate: campaignData.messageTemplate || '',
      mediaUrl: campaignData.mediaUrl,
      targetTags: campaignData.targetTags || [],
      targetSegments: campaignData.targetSegments || [],
      targetContactIds: campaignData.targetContactIds,
      status: campaignData.status || 'draft',
      scheduledAt: campaignData.scheduledAt,
      totalRecipients: campaignData.targetContactIds?.length || 0,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      repliedCount: 0,
      failedCount: 0,
      abTestEnabled: campaignData.abTestEnabled || false,
      variantA: campaignData.variantA,
      variantB: campaignData.variantB,
      createdBy: currentUser.id,
      createdAt: new Date()
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    return newCampaign;
  }, [currentUser.id]);

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  }, []);

  // ============================================
  // Automation Actions
  // ============================================
  const createAutomation = useCallback((automationData: Partial<Automation>) => {
    const newAutomation: Automation = {
      id: uuidv4(),
      name: automationData.name || 'Untitled Automation',
      description: automationData.description,
      isActive: automationData.isActive ?? false,
      trigger: automationData.trigger || { type: 'new-contact', config: {} },
      actions: automationData.actions || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setAutomations(prev => [newAutomation, ...prev]);
    return newAutomation;
  }, []);

  const updateAutomation = useCallback((id: string, updates: Partial<Automation>) => {
    setAutomations(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
    ));
  }, []);

  const deleteAutomation = useCallback((id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggleAutomation = useCallback((id: string) => {
    setAutomations(prev => prev.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive, updatedAt: new Date() } : a
    ));
  }, []);

  // ============================================
  // Task Actions
  // ============================================
  const createTask = useCallback((taskData: Partial<Task>) => {
    const newTask: Task = {
      id: uuidv4(),
      title: taskData.title || 'Untitled Task',
      description: taskData.description,
      contactId: taskData.contactId,
      assignedTo: taskData.assignedTo || currentUser.id,
      assignedBy: taskData.assignedBy || currentUser.id,
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
      reminderAt: taskData.reminderAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [currentUser.id]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
    ));
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: 'completed', completedAt: new Date(), updatedAt: new Date() } : t
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // ============================================
  // Message Actions
  // ============================================
  const sendMessage = useCallback((contactId: string, content: string, isAutomated = false) => {
    const newMessage: Message = {
      id: uuidv4(),
      contactId,
      content,
      direction: 'outbound',
      status: 'sent',
      sentAt: new Date(),
      isAutomated
    };
    setMessages(prev => ({
      ...prev,
      [contactId]: [newMessage, ...(prev[contactId] || [])]
    }));
    setContacts(prev => prev.map(c => 
      c.id === contactId 
        ? { ...c, lastContactedAt: new Date(), messageCount: c.messageCount + 1, updatedAt: new Date() }
        : c
    ));
    return newMessage;
  }, []);

  const receiveMessage = useCallback((contactId: string, content: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      contactId,
      content,
      direction: 'inbound',
      status: 'read',
      sentAt: new Date(),
      readAt: new Date(),
      isAutomated: false
    };
    setMessages(prev => ({
      ...prev,
      [contactId]: [newMessage, ...(prev[contactId] || [])]
    }));
    setContacts(prev => prev.map(c => 
      c.id === contactId 
        ? { ...c, lastReplyAt: new Date(), replyCount: c.replyCount + 1, updatedAt: new Date() }
        : c
    ));
    return newMessage;
  }, []);

  const getConversation = useCallback((contactId: string): Conversation | undefined => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return undefined;
    
    const contactMessages = messages[contactId] || [];
    const unreadCount = contactMessages.filter(m => m.direction === 'inbound' && m.status !== 'read').length;
    
    return {
      contactId,
      contact,
      messages: contactMessages,
      unreadCount,
      lastMessage: contactMessages[0]
    };
  }, [contacts, messages]);

  const getAllConversations = useCallback((): Conversation[] => {
    return contacts
      .filter(c => messages[c.id]?.length > 0)
      .map(c => ({
        contactId: c.id,
        contact: c,
        messages: messages[c.id] || [],
        unreadCount: (messages[c.id] || []).filter(m => m.direction === 'inbound' && m.status !== 'read').length,
        lastMessage: messages[c.id]?.[0]
      }))
      .sort((a, b) => (b.lastMessage?.sentAt.getTime() || 0) - (a.lastMessage?.sentAt.getTime() || 0));
  }, [contacts, messages]);

  // ============================================
  // Export/Import
  // ============================================
  const exportContactsToCSV = useCallback((contactIds?: string[]): string => {
    const contactsToExport = contactIds 
      ? contacts.filter(c => contactIds.includes(c.id))
      : contacts;
    
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Course', 'School', 'Source', 'Status', 'Tags', 'Lead Score', 'Created At'];
    const rows = contactsToExport.map(c => [
      c.id,
      c.name,
      c.phone,
      c.email || '',
      c.course || '',
      c.school || '',
      c.source || '',
      c.status,
      c.tags.join(', '),
      c.leadScore,
      c.createdAt.toISOString()
    ]);
    
    return [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
  }, [contacts]);

  const importContactsFromCSV = useCallback((csvData: string, metadata?: PreUploadMetadata) => {
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const imported: Contact[] = [];
    const errors: string[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => row[h] = values[idx] || '');
        
        if (!row.Name || !row.Phone) {
          errors.push(`Row ${i}: Missing name or phone`);
          continue;
        }
        
        // Check for duplicates
        const exists = contacts.some(c => c.phone === row.Phone);
        if (exists) {
          errors.push(`Row ${i}: Duplicate phone ${row.Phone}`);
          continue;
        }
        
        const newContact: Contact = {
          id: uuidv4(),
          name: row.Name,
          phone: row.Phone,
          email: row.Email,
          course: metadata?.course || row.Course,
          school: metadata?.school || row.School,
          source: metadata?.source || row.Source || 'CSV Import',
          status: (row.Status as LeadStatus) || 'new',
          tags: (row.Tags?.split(',').map(t => t.trim()) as ContactTag[]) || [],
          leadScore: parseInt(row['Lead Score']) || 50,
          createdAt: new Date(),
          updatedAt: new Date(),
          messageCount: 0,
          replyCount: 0,
          hasOptedIn: false,
          notes: [],
          customFields: {}
        };
        imported.push(newContact);
      } catch (err) {
        errors.push(`Row ${i}: Parse error`);
      }
    }
    
    setContacts(prev => [...imported, ...prev]);
    return { imported, errors, count: imported.length };
  }, [contacts]);

  // ============================================
  // Dashboard Stats
  // ============================================
  const getDashboardStats = useCallback((): DashboardStats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newContactsToday = contacts.filter(c => c.createdAt >= today).length;
    const activeLeads = contacts.filter(c => ['interested', 'qualified'].includes(c.status)).length;
    const converted = contacts.filter(c => c.status === 'converted').length;
    const conversionRate = contacts.length > 0 ? Math.round((converted / contacts.length) * 100) : 0;
    
    // Pipeline distribution
    const pipelineDistribution: Record<LeadStatus, number> = {
      new: 0,
      contacted: 0,
      interested: 0,
      qualified: 0,
      converted: 0,
      lost: 0
    };
    contacts.forEach(c => pipelineDistribution[c.status]++);
    
    // Lead score distribution
    const leadScoreDistribution = [
      { range: '0-25', count: contacts.filter(c => c.leadScore <= 25).length },
      { range: '26-50', count: contacts.filter(c => c.leadScore > 25 && c.leadScore <= 50).length },
      { range: '51-75', count: contacts.filter(c => c.leadScore > 50 && c.leadScore <= 75).length },
      { range: '76-100', count: contacts.filter(c => c.leadScore > 75).length }
    ];
    
    // Campaign performance
    const campaignPerformance = campaigns.map(c => ({
      name: c.name,
      sent: c.sentCount,
      delivered: c.deliveredCount,
      read: c.readCount,
      replied: c.repliedCount
    }));
    
    return {
      totalContacts: contacts.length,
      newContactsToday,
      activeLeads,
      conversionRate,
      messagesSentToday: 0,
      messagesReceivedToday: 0,
      replyRate: 0,
      activeCampaigns: campaigns.filter(c => c.status === 'running').length,
      campaignPerformance,
      pipelineDistribution,
      leadScoreDistribution
    };
  }, [contacts, campaigns]);

  // ============================================
  // AI Features (Simulated)
  // ============================================
  const analyzeIntent = useCallback((message: string): 'interested' | 'not-interested' | 'neutral' | 'urgent' => {
    const lower = message.toLowerCase();
    if (lower.includes('interested') || lower.includes('yes') || lower.includes('want') || lower.includes('price') || lower.includes('fee')) {
      return 'interested';
    }
    if (lower.includes('not interested') || lower.includes('no') || lower.includes('stop') || lower.includes('unsubscribe')) {
      return 'not-interested';
    }
    if (lower.includes('urgent') || lower.includes('asap') || lower.includes('emergency') || lower.includes('immediately')) {
      return 'urgent';
    }
    return 'neutral';
  }, []);

  const calculateLeadScore = useCallback((contact: Contact): number => {
    let score = 50;
    
    // Based on status
    if (contact.status === 'converted') score += 30;
    else if (contact.status === 'qualified') score += 25;
    else if (contact.status === 'interested') score += 20;
    else if (contact.status === 'contacted') score += 10;
    else if (contact.status === 'lost') score -= 20;
    
    // Based on engagement
    if (contact.replyCount > 10) score += 15;
    else if (contact.replyCount > 5) score += 10;
    else if (contact.replyCount > 0) score += 5;
    
    // Based on tags
    if (contact.tags.includes('hot')) score += 10;
    if (contact.tags.includes('vip')) score += 5;
    if (contact.tags.includes('not-interested')) score -= 15;
    
    // Recency
    if (contact.lastReplyAt) {
      const daysSinceReply = Math.floor((Date.now() - contact.lastReplyAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceReply < 3) score += 5;
      else if (daysSinceReply > 14) score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }, []);

  return {
    // State
    contacts,
    campaigns,
    automations,
    tasks,
    segments,
    messages,
    notifications,
    currentUser,
    
    // Contact Actions
    addContact,
    addContacts,
    updateContact,
    deleteContact,
    addTagToContact,
    removeTagFromContact,
    addNote,
    filterContacts,
    
    // Campaign Actions
    createCampaign,
    updateCampaign,
    deleteCampaign,
    
    // Automation Actions
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    
    // Task Actions
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    
    // Message Actions
    sendMessage,
    receiveMessage,
    getConversation,
    getAllConversations,
    
    // Import/Export
    exportContactsToCSV,
    importContactsFromCSV,
    
    // Dashboard
    getDashboardStats,
    
    // AI
    analyzeIntent,
    calculateLeadScore
  };
}
