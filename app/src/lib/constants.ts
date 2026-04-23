// ============================================
// WhatsApp Lead Intelligence Platform - Constants
// ============================================

import type { LeadStatus, ContactTag, UserRole } from '@/types';

// Courses
export const COURSES = [
  'Science (PCM)',
  'Science (PCB)',
  'Science (PCMB)',
  'Commerce (with Maths)',
  'Commerce (without Maths)',
  'Arts / Humanities',
  'Vocational',
  'Other'
] as const;

// Schools/Colleges
export const SCHOOLS = [
  'School of Computer Science',
  'School of Engineering',
  'School of Business',
  'School of Management',
  'School of Commerce',
  'School of Arts',
  'School of Science',
  'School of Design',
  'School of Law',
  'School of Medicine',
  'School of Pharmacy',
  'Other'
] as const;

// Lead Sources
export const LEAD_SOURCES = [
  'WhatsApp Group',
  'WhatsApp Status',
  'Facebook Ad',
  'Instagram',
  'Google Ads',
  'LinkedIn',
  'Website',
  'Referral',
  'Walk-in',
  'Phone Inquiry',
  'Email Campaign',
  'Event',
  'Bulk Import',
  'Manual Entry'
] as const;

// Lead Statuses with labels
export const LEAD_STATUSES: { value: LeadStatus; label: string; description: string }[] = [
  { value: 'new', label: 'New', description: 'Just added, no contact yet' },
  { value: 'contacted', label: 'Contacted', description: 'Initial contact made' },
  { value: 'interested', label: 'Interested', description: 'Shown interest in courses' },
  { value: 'converted', label: 'Converted', description: 'Successfully enrolled' },
  { value: 'lost', label: 'Lost', description: 'Not interested or unreachable' }
];

// Contact Tags with labels
export const CONTACT_TAGS: { value: ContactTag; label: string; description: string }[] = [
  { value: 'hot', label: 'Hot', description: 'High intent, ready to convert' },
  { value: 'warm', label: 'Warm', description: 'Moderate interest' },
  { value: 'cold', label: 'Cold', description: 'Low engagement' },
  { value: 'interested', label: 'Interested', description: 'Actively interested' },
  { value: 'not-interested', label: 'Not Interested', description: 'Declined or opted out' },
  { value: 'follow-up', label: 'Follow-up', description: 'Needs follow-up' },
  { value: 'vip', label: 'VIP', description: 'High-value prospect' },
  { value: 'do-not-disturb', label: 'DND', description: 'Do not contact' }
];

// User Roles with permissions
export const USER_ROLES: { value: UserRole; label: string; permissions: string[] }[] = [
  {
    value: 'admin',
    label: 'Administrator',
    permissions: ['all']
  },
  {
    value: 'manager',
    label: 'Manager',
    permissions: ['view_contacts', 'edit_contacts', 'view_campaigns', 'create_campaigns', 'view_automations', 'create_automations', 'view_analytics', 'manage_team']
  },
  {
    value: 'agent',
    label: 'Sales Agent',
    permissions: ['view_contacts', 'edit_contacts', 'view_campaigns', 'send_messages', 'create_tasks']
  },
  {
    value: 'viewer',
    label: 'Viewer',
    permissions: ['view_contacts', 'view_analytics']
  }
];

// Campaign Statuses
export const CAMPAIGN_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'running', label: 'Running' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' }
] as const;

// Automation Triggers
export const AUTOMATION_TRIGGERS = [
  { value: 'new-contact', label: 'New Contact Added', description: 'When a new contact is added to the system' },
  { value: 'tag-added', label: 'Tag Added', description: 'When a specific tag is added to a contact' },
  { value: 'tag-removed', label: 'Tag Removed', description: 'When a specific tag is removed from a contact' },
  { value: 'message-received', label: 'Message Received', description: 'When a contact sends a message' },
  { value: 'no-reply', label: 'No Reply', description: 'When a contact hasn\'t replied for X days' },
  { value: 'time-based', label: 'Time Based', description: 'Triggered at a specific time' }
] as const;

// Automation Actions
export const AUTOMATION_ACTIONS = [
  { value: 'send-message', label: 'Send Message', description: 'Send a WhatsApp message' },
  { value: 'add-tag', label: 'Add Tag', description: 'Add a tag to the contact' },
  { value: 'remove-tag', label: 'Remove Tag', description: 'Remove a tag from the contact' },
  { value: 'assign-task', label: 'Assign Task', description: 'Create a task for a team member' },
  { value: 'update-field', label: 'Update Field', description: 'Update a contact field' },
  { value: 'wait', label: 'Wait', description: 'Wait for a specified duration' }
] as const;

// Task Priorities
export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
] as const;

// Task Statuses
export const TASK_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' }
] as const;

// Message Templates
export const MESSAGE_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Message',
    content: 'Hello {{name}}! 👋 Welcome to our institute. How can we help you today?'
  },
  {
    id: 'follow-up',
    name: 'Follow-up',
    content: 'Hi {{name}}! Just following up on our previous conversation. Do you have any questions?'
  },
  {
    id: 'course-info',
    name: 'Course Information',
    content: 'Hi {{name}}! Here\'s the information about our {{course}} program. Let me know if you\'d like to know more!'
  },
  {
    id: 'admission-open',
    name: 'Admission Open',
    content: '🎓 Admissions are now open for {{course}}! Early bird discount available. Reply INTERESTED to learn more.'
  },
  {
    id: 'reminder',
    name: 'Reminder',
    content: 'Hello {{name}}! This is a friendly reminder about our discussion regarding {{course}}. Looking forward to hearing from you!'
  },
  {
    id: 'scholarship',
    name: 'Scholarship Announcement',
    content: '🏆 Great news {{name}}! We\'re offering scholarships for {{course}}. Limited seats available. Apply now!'
  },
  {
    id: 'event-invite',
    name: 'Event Invitation',
    content: 'Hi {{name}}! You\'re invited to our upcoming open house event. Would you like to attend?'
  },
  {
    id: 'fee-deadline',
    name: 'Fee Deadline Reminder',
    content: 'Hello {{name}}! This is a reminder that the fee payment deadline is approaching. Please complete your registration.'
  }
];

// Time zones
export const TIME_ZONES = [
  'UTC',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney'
] as const;

// Date formats
export const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
] as const;

// Items per page options
export const ITEMS_PER_PAGE = [10, 25, 50, 100] as const;

// Lead score ranges
export const LEAD_SCORE_RANGES = [
  { min: 0, max: 25, label: 'Cold', color: 'bg-blue-500' },
  { min: 26, max: 50, label: 'Warm', color: 'bg-yellow-500' },
  { min: 51, max: 75, label: 'Hot', color: 'bg-orange-500' },
  { min: 76, max: 100, label: 'Very Hot', color: 'bg-red-500' }
];

// Dashboard chart colors
export const CHART_COLORS = {
  primary: '#10b981',
  secondary: '#3b82f6',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  pink: '#ec4899',
  slate: '#64748b'
};

// Navigation items
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { id: 'contacts', label: 'Contacts', icon: 'Users', path: '/contacts' },
  { id: 'inbox', label: 'Inbox', icon: 'MessageSquare', path: '/inbox' },
  { id: 'campaigns', label: 'Campaigns', icon: 'Megaphone', path: '/campaigns' },
  { id: 'automations', label: 'Automations', icon: 'Zap', path: '/automations' },
  { id: 'tasks', label: 'Tasks', icon: 'CheckSquare', path: '/tasks' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', path: '/analytics' }
];

// Quick actions
export const QUICK_ACTIONS = [
  { id: 'add-contact', label: 'Add Contact', icon: 'UserPlus' },
  { id: 'import-contacts', label: 'Import Contacts', icon: 'Upload' },
  { id: 'send-campaign', label: 'Send Campaign', icon: 'Send' },
  { id: 'create-task', label: 'Create Task', icon: 'PlusSquare' }
];

// Filter presets
export const FILTER_PRESETS = [
  { id: 'hot-leads', label: 'Hot Leads', filter: { tags: ['hot'], status: ['interested'] } },
  { id: 'needs-follow-up', label: 'Needs Follow-up', filter: { tags: ['follow-up'] } },
  { id: 'new-today', label: 'New Today', filter: {} },
  { id: 'no-reply-7d', label: 'No Reply (7 days)', filter: { lastContactedDays: 7 } },
  { id: 'converted', label: 'Converted', filter: { status: ['converted'] } },
  { id: 'vip', label: 'VIP Contacts', filter: { tags: ['vip'] } }
];
