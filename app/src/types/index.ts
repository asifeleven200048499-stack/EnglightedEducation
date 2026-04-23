// ============================================
// WhatsApp Lead Intelligence Platform - Types
// ============================================

// Lead Status
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'converted' | 'lost';

// Contact Tags
export type ContactTag = 'hot' | 'warm' | 'cold' | 'interested' | 'not-interested' | 'follow-up' | 'vip' | 'do-not-disturb';

// Message Status
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

// Campaign Status
export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed';

// Task Status
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

// Task Priority
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// User Roles
export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer';

// ============================================
// Core Contact/Lead Model
// ============================================
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  
  // Metadata
  course?: string;
  school?: string;
  source?: string;
  
  // Status & Tags
  status: LeadStatus;
  tags: ContactTag[];
  
  // Lead Scoring (0-100)
  leadScore: number;
  
  // AI Analysis
  intent?: 'interested' | 'not-interested' | 'neutral' | 'urgent';
  lastMessageIntent?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
  lastReplyAt?: Date;
  
  // Stats
  messageCount: number;
  replyCount: number;
  
  // Consent
  hasOptedIn: boolean;
  optedInAt?: Date;
  
  // Notes
  notes: Note[];
  
  // Custom Fields
  customFields: Record<string, string>;
}

// ============================================
// Note Model
// ============================================
export interface Note {
  id: string;
  contactId: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  attachments?: Attachment[];
}

// ============================================
// Attachment Model
// ============================================
export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'voice' | 'video';
  url: string;
  size: number;
  createdAt: Date;
}

// ============================================
// Message Model
// ============================================
export interface Message {
  id: string;
  contactId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: MessageStatus;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  
  // Media
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'voice' | 'video';
  
  // Campaign reference
  campaignId?: string;
  isAutomated: boolean;
}

// ============================================
// Campaign Model
// ============================================
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  
  // Content
  messageTemplate: string;
  mediaUrl?: string;
  
  // Targeting
  targetTags: ContactTag[];
  targetSegments: string[];
  targetContactIds?: string[];
  
  // Scheduling
  status: CampaignStatus;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Stats
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  repliedCount: number;
  failedCount: number;
  
  // A/B Testing
  abTestEnabled: boolean;
  variantA?: string;
  variantB?: string;
  
  createdBy: string;
  createdAt: Date;
}

// ============================================
// Automation/Workflow Model
// ============================================
export interface Automation {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  
  // Trigger
  trigger: {
    type: 'new-contact' | 'tag-added' | 'tag-removed' | 'message-received' | 'no-reply' | 'time-based';
    config: Record<string, any>;
  };
  
  // Actions
  actions: AutomationAction[];
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Automation Action
// ============================================
export interface AutomationAction {
  id: string;
  type: 'send-message' | 'add-tag' | 'remove-tag' | 'assign-task' | 'update-field' | 'wait';
  config: Record<string, any>;
  order: number;
}

// ============================================
// Task Model
// ============================================
export interface Task {
  id: string;
  title: string;
  description?: string;
  
  // Assignment
  contactId?: string;
  assignedTo: string;
  assignedBy: string;
  
  // Status
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Scheduling
  dueDate: Date;
  completedAt?: Date;
  
  // Reminders
  reminderAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Segment Model
// ============================================
export interface Segment {
  id: string;
  name: string;
  description?: string;
  
  // Filters
  filters: SegmentFilter[];
  
  // Stats
  contactCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Segment Filter
// ============================================
export interface SegmentFilter {
  field: string;
  operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than' | 'in' | 'not-in' | 'exists' | 'not-exists';
  value: any;
}

// ============================================
// User Model
// ============================================
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  
  // Permissions
  permissions: string[];
  
  // Stats
  contactsAssigned: number;
  tasksCompleted: number;
  messagesSent: number;
  
  createdAt: Date;
  lastLoginAt?: Date;
}

// ============================================
// Dashboard Stats
// ============================================
export interface DashboardStats {
  totalContacts: number;
  newContactsToday: number;
  activeLeads: number;
  conversionRate: number;
  
  // Messages
  messagesSentToday: number;
  messagesReceivedToday: number;
  replyRate: number;
  
  // Campaigns
  activeCampaigns: number;
  campaignPerformance: {
    name: string;
    sent: number;
    delivered: number;
    read: number;
    replied: number;
  }[];
  
  // Pipeline
  pipelineDistribution: Record<LeadStatus, number>;
  
  // Lead Score Distribution
  leadScoreDistribution: {
    range: string;
    count: number;
  }[];
}

// ============================================
// OCR Extracted Contact
// ============================================
export interface ExtractedContact {
  name: string;
  phone: string;
  rawText: string;
  confidence: number;
  context?: string;
}

// ============================================
// Processing State
// ============================================
export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  status: string;
}

// ============================================
// Notification
// ============================================
export interface Notification {
  id: string;
  type: 'new-lead' | 'message-reply' | 'task-due' | 'campaign-complete' | 'follow-up';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

// ============================================
// Chat Conversation
// ============================================
export interface Conversation {
  contactId: string;
  contact: Contact;
  messages: Message[];
  unreadCount: number;
  lastMessage?: Message;
}

// ============================================
// Pre-upload Metadata
// ============================================
export interface PreUploadMetadata {
  course?: string;
  school?: string;
  source?: string;
  tags?: ContactTag[];
  defaultStatus?: LeadStatus;
}

// ============================================
// Import/Export
// ============================================
export interface ImportResult {
  total: number;
  imported: number;
  duplicates: number;
  failed: number;
  errors: string[];
}

// ============================================
// Filter Options
// ============================================
export interface ContactFilterOptions {
  search?: string;
  status?: LeadStatus[];
  tags?: ContactTag[];
  course?: string[];
  school?: string[];
  source?: string[];
  leadScoreMin?: number;
  leadScoreMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
  lastContactedDays?: number;
  hasReplied?: boolean;
  intent?: string[];
}
