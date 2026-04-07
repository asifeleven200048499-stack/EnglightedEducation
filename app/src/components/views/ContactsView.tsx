import { useState, useRef, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import {
  Users,
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  MoreHorizontal,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  Tag,
  Star,
  Edit2,
  Trash2,
  MessageSquare,
  Check,
  X,
  ChevronDown,
  QrCode,
  ExternalLink,
  Copy,
  ScanLine,
  Loader2,
  FileImage,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Contact, ContactTag, LeadStatus, ExtractedContact, ProcessingState, PreUploadMetadata } from '@/types';
import { 
  formatPhone, 
  formatDate, 
  formatRelativeTime, 
  getStatusColor, 
  getTagColor,
  truncate, 
  getInitials, 
  getAvatarColor,
  downloadFile,
  generateWhatsAppLink,
  copyToClipboard
} from '@/lib/utils';
import { 
  COURSES, 
  SCHOOLS, 
  LEAD_SOURCES, 
  LEAD_STATUSES, 
  CONTACT_TAGS
} from '@/lib/constants';

interface ContactsViewProps {
  store: any;
  searchQuery: string;
  setSelectedContact: (contact: Contact | null) => void;
}

export function ContactsView({ store, searchQuery, setSelectedContact }: ContactsViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [filters, setFilters] = useState({
    status: [] as LeadStatus[],
    tags: [] as ContactTag[],
    course: '',
    school: '',
    source: ''
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Filter contacts
  const filteredContacts = store.filterContacts({
    search: searchQuery,
    status: filters.status.length > 0 ? filters.status : undefined,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    course: filters.course ? [filters.course] : undefined,
    school: filters.school ? [filters.school] : undefined,
    source: filters.source ? [filters.source] : undefined
  });

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map((c: Contact) => c.id));
    }
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleBulkTag = (tag: ContactTag) => {
    selectedContacts.forEach((id: string) => {
      store.addTagToContact(id, tag);
    });
    setSelectedContacts([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedContacts.length} contacts?`)) {
      selectedContacts.forEach((id: string) => {
        store.deleteContact(id);
      });
      setSelectedContacts([]);
    }
  };

  const handleExport = () => {
    const csv = store.exportContactsToCSV(selectedContacts.length > 0 ? selectedContacts : undefined);
    downloadFile(csv, `contacts_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-500">Manage your leads and contacts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search by name, phone, email..." className="pl-10" />
              </div>
            </div>
            
            <Select 
              value={filters.status.join(',')} 
              onValueChange={(v) => setFilters({...filters, status: v ? v.split(',') as LeadStatus[] : []})}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.course} 
              onValueChange={(v) => setFilters({...filters, course: v})}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                {COURSES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              className="w-[180px]"
              placeholder="School"
              value={filters.school}
              onChange={(e) => setFilters({...filters, school: e.target.value})}
            />

            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'table' ? 'default' : 'outline'} 
                size="icon"
                onClick={() => setViewMode('table')}
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Users className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedContacts.length > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-900">
                {selectedContacts.length} contacts selected
              </span>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Tag className="w-4 h-4 mr-2" />
                      Add Tag
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48">
                    <div className="space-y-2">
                      {CONTACT_TAGS.map(tag => (
                        <button
                          key={tag.value}
                          onClick={() => handleBulkTag(tag.value)}
                          className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-sm"
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contacts Display */}
      {viewMode === 'table' ? (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Course</TableHead>
                <TableHead className="hidden lg:table-cell">School</TableHead>
                <TableHead className="hidden lg:table-cell">Tags</TableHead>
                <TableHead className="hidden md:table-cell">Lead Score</TableHead>
                <TableHead className="hidden lg:table-cell">Last Contact</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact: Contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => handleSelectContact(contact.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className={`${getAvatarColor(contact.name)} text-white`}>
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{contact.name}</p>
                        <p className="text-sm text-slate-500">{formatPhone(contact.phone)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(contact.status)}>
                      {contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{contact.course || '-'}</TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[150px] truncate">{contact.school || '-'}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {contact.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className={getTagColor(tag)}>
                          {tag}
                        </Badge>
                      ))}
                      {contact.tags.length > 2 && (
                        <Badge variant="outline">+{contact.tags.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Progress value={contact.leadScore} className="w-16 h-2" />
                      <span className="text-sm">{contact.leadScore}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{formatRelativeTime(contact.lastContactedAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.location.href = `tel:${contact.phone}`}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingContact(contact)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(generateWhatsAppLink(contact.phone), '_blank')}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => store.deleteContact(contact.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact: Contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className={`${getAvatarColor(contact.name)} text-white`}>
                        {getInitials(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">{contact.name}</p>
                      <p className="text-sm text-slate-500">{formatPhone(contact.phone)}</p>
                    </div>
                  </div>
                  <Checkbox 
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={() => handleSelectContact(contact.id)}
                  />
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-sm">{contact.leadScore}</span>
                    </div>
                  </div>
                  
                  {contact.course && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <GraduationCap className="w-4 h-4" />
                      {contact.course}
                    </div>
                  )}
                  
                  <div className="flex gap-1 flex-wrap">
                    {contact.tags.map(tag => (
                      <Badge key={tag} variant="outline" className={`text-xs ${getTagColor(tag)}`}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-emerald-600 border-emerald-200"
                    onClick={() => window.location.href = `tel:${contact.phone}`}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(generateWhatsAppLink(contact.phone), '_blank')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingContact(contact)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Import Modal */}
      <ImportContactModal 
        open={showImportModal} 
        onClose={() => setShowImportModal(false)} 
        store={store}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        store={store}
      />

      {/* Edit Contact Modal */}
      {editingContact && (
        <EditContactModal
          contact={editingContact}
          open={!!editingContact}
          onClose={() => setEditingContact(null)}
          store={store}
        />
      )}
    </div>
  );
}

// ============================================
// Import Contact Modal with OCR
// ============================================
function ImportContactModal({ open, onClose, store }: { open: boolean; onClose: () => void; store: any }) {
  const [activeTab, setActiveTab] = useState('ocr');
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    status: ''
  });
  const [extractedContacts, setExtractedContacts] = useState<ExtractedContact[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<PreUploadMetadata>({});
  const [csvText, setCsvText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // OCR Processing
  const processImage = async (file: File) => {
    setProcessing({ isProcessing: true, progress: 0, status: 'Initializing OCR...' });
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target?.result as string);
      reader.readAsDataURL(file);

      const worker = await createWorker('eng');
      setProcessing({ isProcessing: true, progress: 30, status: 'Processing image...' });

      const result = await worker.recognize(file);
      setProcessing({ isProcessing: true, progress: 70, status: 'Extracting contacts...' });

      const extracted = extractContactsFromText(result.data.text);
      setExtractedContacts(extracted);

      await worker.terminate();
      setProcessing({ isProcessing: false, progress: 100, status: 'Complete!' });
    } catch (error) {
      setProcessing({ isProcessing: false, progress: 0, status: 'Error processing image' });
    }
  };

  const extractContactsFromText = (text: string): ExtractedContact[] => {
    const phoneRegex = /\+?\d[\d\s\-\(\)]{8,}\d/g;
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const contacts: ExtractedContact[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const phoneMatches = line.match(phoneRegex);
      
      if (phoneMatches) {
        const phone = phoneMatches[0].replace(/[\s\-\(\)]/g, '');
        let name = '';
        
        // Look for name in previous lines
        for (let j = Math.max(0, i - 3); j < i; j++) {
          const prevLine = lines[j];
          if (/[a-zA-Z]/.test(prevLine) && !prevLine.match(phoneRegex) && prevLine.length > 2 && prevLine.length < 50) {
            if (!/^(Messages|Calls|Status|Settings|Search|Today|Yesterday)$/i.test(prevLine)) {
              name = prevLine;
              break;
            }
          }
        }
        
        contacts.push({
          name: name || `Contact ${contacts.length + 1}`,
          phone,
          rawText: line,
          confidence: 0.8
        });
      }
    }
    
    return contacts;
  };

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSaveExtracted = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const result = await store.addContacts(
        extractedContacts.map(ec => ({
          name: ec.name,
          phone: ec.phone,
          leadScore: 50
        })),
        metadata
      );
      const msg = result.duplicates > 0
        ? `Saved ${result.created} contacts. ${result.duplicates} duplicate(s) skipped.`
        : `Saved ${result.created} contacts successfully.`;
      onClose();
      setExtractedContacts([]);
      setPreviewImage(null);
      alert(msg);
    } catch (e) {
      setSaveError('Failed to save contacts. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCSVImport = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await store.importContactsFromCSV(csvText, metadata);
      onClose();
      setCsvText('');
    } catch (e) {
      setSaveError('Failed to import CSV. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Contacts
          </DialogTitle>
          <DialogDescription>
            Import contacts from WhatsApp screenshots or CSV files
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ocr">
              <ScanLine className="w-4 h-4 mr-2" />
              OCR Import
            </TabsTrigger>
            <TabsTrigger value="csv">
              <FileImage className="w-4 h-4 mr-2" />
              CSV Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ocr" className="space-y-4">
            {/* Metadata */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Course</Label>
                <Select value={metadata.course} onValueChange={(v) => setMetadata({...metadata, course: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>School</Label>
                <Input
                  placeholder="Enter school name"
                  value={metadata.school || ''}
                  onChange={(e) => setMetadata({...metadata, school: e.target.value})}
                />
              </div>
              <div>
                <Label>Source</Label>
                <Select value={metadata.source} onValueChange={(v) => setMetadata({...metadata, source: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Upload Area */}
            {!previewImage && !processing.isProcessing && (
              <div 
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file?.type.startsWith('image/')) processImage(file);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <FileImage className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <p className="text-lg font-medium">Drop WhatsApp screenshot here</p>
                <p className="text-sm text-slate-500">or click to browse</p>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && processImage(e.target.files[0])}
                />
              </div>
            )}

            {/* Processing */}
            {processing.isProcessing && (
              <div className="p-6 bg-slate-50 rounded-lg text-center">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-emerald-600 mb-4" />
                <p className="font-medium">{processing.status}</p>
                <Progress value={processing.progress} className="mt-4" />
              </div>
            )}

            {/* Results */}
            {extractedContacts.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Extracted Contacts ({extractedContacts.length})</h4>
                  <Button onClick={handleSaveExtracted} className="bg-emerald-600" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                    {saving ? 'Saving...' : 'Save All'}
                  </Button>
                </div>
                {saveError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}
                <div className="grid grid-cols-2 gap-4">
                  {previewImage && (
                    <img src={previewImage} alt="Preview" className="rounded-lg border max-h-64 object-contain" />
                  )}
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {extractedContacts.map((contact, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded border flex justify-between items-center">
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-slate-500">{contact.phone}</p>
                        </div>
                        <Badge variant="outline">{Math.round(contact.confidence * 100)}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="csv" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Course</Label>
                <Select value={metadata.course} onValueChange={(v) => setMetadata({...metadata, course: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>School</Label>
                <Input
                  placeholder="Enter school name"
                  value={metadata.school || ''}
                  onChange={(e) => setMetadata({...metadata, school: e.target.value})}
                />
              </div>
              <div>
                <Label>Source</Label>
                <Select value={metadata.source} onValueChange={(v) => setMetadata({...metadata, source: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Textarea
              placeholder="Paste CSV data here...\nName,Phone,Email,Course\nJohn Doe,+919876543210,john@email.com,BCA"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <Button onClick={handleCSVImport} className="w-full bg-emerald-600" disabled={saving || !csvText.trim()}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {saving ? 'Importing...' : 'Import CSV'}
            </Button>
            {saveError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Add Contact Modal
// ============================================
function AddContactModal({ open, onClose, store }: { open: boolean; onClose: () => void; store: any }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    course: '',
    school: '',
    source: 'Manual Entry',
    status: 'new' as LeadStatus,
    tags: [] as ContactTag[]
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await store.addContact({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        course: formData.course,
        school: formData.school,
        source: formData.source,
        status: formData.status,
        tags: formData.tags,
        leadScore: 50
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+91XXXXXXXXXX"
              />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="email@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Course</Label>
              <Select value={formData.course} onValueChange={(v) => setFormData({...formData, course: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {COURSES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>School</Label>
              <Input
                value={formData.school}
                onChange={(e) => setFormData({...formData, school: e.target.value})}
                placeholder="Enter school name"
              />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v as LeadStatus})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CONTACT_TAGS.map(tag => (
                <button
                  key={tag.value}
                  onClick={() => {
                    const newTags = formData.tags.includes(tag.value)
                      ? formData.tags.filter(t => t !== tag.value)
                      : [...formData.tags, tag.value];
                    setFormData({...formData, tags: newTags});
                  }}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    formData.tags.includes(tag.value)
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={saving || !formData.name || !formData.phone} className="w-full bg-emerald-600">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Add Contact'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Edit Contact Modal
// ============================================
function EditContactModal({ contact, open, onClose, store }: { contact: Contact; open: boolean; onClose: () => void; store: any }) {
  const [formData, setFormData] = useState({
    name: contact.name,
    phone: contact.phone,
    email: contact.email || '',
    course: contact.course || '',
    school: contact.school || '',
    status: contact.status,
    tags: contact.tags
  });

  const handleSubmit = () => {
    store.updateContact(contact.id, formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Course</Label>
              <Select value={formData.course} onValueChange={(v) => setFormData({...formData, course: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {COURSES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>School</Label>
              <Input
                value={formData.school}
                onChange={(e) => setFormData({...formData, school: e.target.value})}
                placeholder="Enter school name"
              />
            </div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v as LeadStatus})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CONTACT_TAGS.map(tag => (
                <button
                  key={tag.value}
                  onClick={() => {
                    const newTags = formData.tags.includes(tag.value)
                      ? formData.tags.filter(t => t !== tag.value)
                      : [...formData.tags, tag.value];
                    setFormData({...formData, tags: newTags});
                  }}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    formData.tags.includes(tag.value)
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1 bg-emerald-600">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
