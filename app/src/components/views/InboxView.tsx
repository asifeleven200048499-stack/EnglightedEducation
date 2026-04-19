import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, Send, Paperclip, Smile, MoreVertical, CheckCheck, Check,
  Phone, Video, ArrowLeft, MessageSquare, Reply, Forward, Trash2,
  Star, Copy, X, CornerUpLeft, FileText
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { api } from '@/lib/api';
import type { Message } from '@/types';

interface InboxViewProps { store: any; }

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatConvDate(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 24 * 60 * 60 * 1000) return formatTime(date);
  if (diff < 7 * 24 * 60 * 60 * 1000) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function formatDateSeparator(date: Date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (msgDate.getTime() === today.getTime()) return 'Today';
  if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function InboxView({ store }: InboxViewProps) {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [contextMenu, setContextMenu] = useState<{ message: Message; x: number; y: number } | null>(null);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [forwardMsg, setForwardMsg] = useState<Message | null>(null);
  const [searchMsg, setSearchMsg] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [sendingTemplate, setSendingTemplate] = useState(false);

  const handleSendTemplate = async () => {
    if (!selectedContactId || sendingTemplate) return;
    setSendingTemplate(true);
    try {
      await api.whatsappSendTemplate(selectedContactId);
      await store.loadMessages(selectedContactId);
    } catch {
      alert('Failed to send template');
    } finally {
      setSendingTemplate(false);
    }
  };

  const conversations = store.getAllConversations();
  const filteredConversations = conversations.filter((conv: any) =>
    conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.contact.phone.includes(searchQuery)
  );

  const selectedConversation = selectedContactId
    ? conversations.find((c: any) => c.contactId === selectedContactId)
    : null;

  useEffect(() => {
    if (selectedContactId) store.loadMessages(selectedContactId);
  }, [selectedContactId]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!selectedContactId) return;
    const interval = setInterval(async () => {
      const msgs = await api.getMessages(selectedContactId);
      store.setMessagesForContact(selectedContactId, msgs);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedContactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages?.length]);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedContactId) return;
    const text = replyTo ? `> ${replyTo.content}\n\n${messageText.trim()}` : messageText.trim();
    setMessageText('');
    setReplyTo(null);
    try {
      await api.whatsappSend(selectedContactId, text);
      await store.loadMessages(selectedContactId);
    } catch {
      store.sendMessage(selectedContactId, text);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ message, x: e.clientX, y: e.clientY });
  };

  const handleCopy = (msg: Message) => {
    navigator.clipboard.writeText(msg.content);
    setContextMenu(null);
  };

  const handleStar = (msg: Message) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      next.has(msg.id) ? next.delete(msg.id) : next.add(msg.id);
      return next;
    });
    setContextMenu(null);
  };

  const handleDelete = (msg: Message) => {
    setDeletedIds(prev => new Set(prev).add(msg.id));
    setContextMenu(null);
  };

  const handleReply = (msg: Message) => {
    setReplyTo(msg);
    setContextMenu(null);
    inputRef.current?.focus();
  };

  const handleForward = (msg: Message) => {
    setForwardMsg(msg);
    setContextMenu(null);
  };

  const sortedMessages = selectedConversation
    ? [...selectedConversation.messages]
        .filter((m: Message) => !deletedIds.has(m.id))
        .sort((a: Message, b: Message) => a.sentAt.getTime() - b.sentAt.getTime())
        .filter((m: Message) => !searchMsg || m.content.toLowerCase().includes(searchMsg.toLowerCase()))
    : [];

  const MessageTick = ({ message }: { message: Message }) => {
    if (message.direction !== 'outbound') return null;
    if (message.status === 'read') return <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />;
    if (message.status === 'delivered') return <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" />;
    return <Check className="w-3.5 h-3.5 text-[#8696a0]" />;
  };

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-lg overflow-hidden border border-slate-200" style={{ background: '#111b21' }}>

      {/* ── Conversation List ── */}
      <div
        className={`flex flex-col border-r border-[#2a3942] ${showMobileChat ? 'hidden md:flex' : 'flex'}`}
        style={{ width: '100%', maxWidth: 360, background: '#111b21', flexShrink: 0 }}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ background: '#202c33' }}>
          <span className="text-white font-semibold text-base">Chats</span>
        </div>
        <div className="px-3 py-2" style={{ background: '#111b21' }}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: '#202c33' }}>
            <Search className="w-4 h-4 text-[#8696a0]" />
            <input
              className="flex-1 bg-transparent text-sm text-white placeholder-[#8696a0] outline-none"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-[#8696a0] text-sm">
              <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
              No conversations
            </div>
          )}
          {filteredConversations.map((conv: any) => {
            const isSelected = selectedContactId === conv.contactId;
            const lastMsg = conv.messages[conv.messages.length - 1] ?? conv.lastMessage;
            return (
              <button
                key={conv.contactId}
                onClick={() => { setSelectedContactId(conv.contactId); setShowMobileChat(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ background: isSelected ? '#2a3942' : 'transparent' }}
                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#202c33'; }}
                onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarFallback className={`${getAvatarColor(conv.contact.name)} text-white text-sm font-medium`}>
                    {getInitials(conv.contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 border-b border-[#2a3942] pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium text-sm truncate">{conv.contact.name}</span>
                    {lastMsg && <span className="text-xs text-[#8696a0] ml-2 flex-shrink-0">{formatConvDate(lastMsg.sentAt)}</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {lastMsg?.direction === 'outbound' && <MessageTick message={lastMsg} />}
                    <p className="text-sm text-[#8696a0] truncate flex-1">{lastMsg?.content ?? 'No messages'}</p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#00a884] text-white text-xs flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chat Panel ── */}
      {selectedConversation ? (
        <div className={`flex-1 flex flex-col min-w-0 ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5" style={{ background: '#202c33' }}>
            <div className="flex items-center gap-3">
              <button className="md:hidden p-2 rounded-full hover:bg-[#2a3942] text-[#aebac1]" onClick={() => setShowMobileChat(false)}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Avatar className="w-10 h-10">
                <AvatarFallback className={`${getAvatarColor(selectedConversation.contact.name)} text-white text-sm`}>
                  {getInitials(selectedConversation.contact.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium text-sm">{selectedConversation.contact.name}</p>
                <p className="text-[#8696a0] text-xs">{selectedConversation.contact.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#aebac1]">
              <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-full hover:bg-[#2a3942]"><Search className="w-5 h-5" /></button>
              <button className="p-2 rounded-full hover:bg-[#2a3942]"><Video className="w-5 h-5" /></button>
              <button className="p-2 rounded-full hover:bg-[#2a3942]"><Phone className="w-5 h-5" /></button>
              <button className="p-2 rounded-full hover:bg-[#2a3942]"><MoreVertical className="w-5 h-5" /></button>
            </div>
          </div>

          {/* In-chat search */}
          {showSearch && (
            <div className="flex items-center gap-2 px-4 py-2" style={{ background: '#202c33' }}>
              <Search className="w-4 h-4 text-[#8696a0]" />
              <input
                autoFocus
                className="flex-1 bg-transparent text-sm text-white placeholder-[#8696a0] outline-none"
                placeholder="Search messages..."
                value={searchMsg}
                onChange={(e) => setSearchMsg(e.target.value)}
              />
              <button onClick={() => { setShowSearch(false); setSearchMsg(''); }} className="text-[#8696a0]"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-16 py-4" style={{ background: '#0b141a' }}>
            {sortedMessages.map((message: Message, idx: number) => {
              const isOut = message.direction === 'outbound';
              const isStarred = starredIds.has(message.id);
              const prevMsg = sortedMessages[idx - 1];
              const showDateSep = !prevMsg || !isSameDay(prevMsg.sentAt, message.sentAt);
              const isReply = message.content.startsWith('> ');
              const replyText = isReply ? message.content.split('\n\n')[0].replace('> ', '') : null;
              const mainText = isReply ? message.content.split('\n\n').slice(1).join('\n\n') : message.content;

              return (
                <div key={message.id}>
                  {showDateSep && (
                    <div className="flex justify-center my-3">
                      <span className="text-xs px-3 py-1 rounded-full text-[#e9edef]" style={{ background: '#182229' }}>
                        {formatDateSeparator(message.sentAt)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex ${isOut ? 'justify-end' : 'justify-start'} mb-1 group`}
                    onContextMenu={(e) => handleContextMenu(e, message)}
                  >
                    {/* Hover actions */}
                    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOut ? 'order-first mr-2' : 'order-last ml-2'}`}>
                      <button onClick={() => handleReply(message)} className="p-1 rounded-full hover:bg-[#2a3942] text-[#8696a0]"><Reply className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleContextMenu(e, message); }} className="p-1 rounded-full hover:bg-[#2a3942] text-[#8696a0]"><MoreVertical className="w-4 h-4" /></button>
                    </div>

                    <div
                      className="relative max-w-[65%] px-3 py-2 rounded-lg shadow-sm"
                      style={{ background: isOut ? '#005c4b' : '#202c33', borderRadius: isOut ? '8px 0 8px 8px' : '0 8px 8px 8px' }}
                    >
                      {/* Bubble tail */}
                      <div className="absolute top-0 w-2 h-2" style={{
                        [isOut ? 'right' : 'left']: -6,
                        borderTop: `8px solid ${isOut ? '#005c4b' : '#202c33'}`,
                        borderLeft: isOut ? '8px solid transparent' : 'none',
                        borderRight: isOut ? 'none' : '8px solid transparent',
                      }} />

                      {/* Reply preview */}
                      {replyText && (
                        <div className="mb-2 px-2 py-1 rounded border-l-4 border-[#00a884] text-xs text-[#8696a0] truncate" style={{ background: 'rgba(0,0,0,0.2)' }}>
                          {replyText}
                        </div>
                      )}

                      <p className="text-[#e9edef] text-sm leading-relaxed whitespace-pre-wrap break-words">{mainText}</p>

                      <div className="flex items-center justify-end gap-1 mt-1">
                        {isStarred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                        <span className="text-[10px] text-[#8696a0]">{formatTime(message.sentAt)}</span>
                        <MessageTick message={message} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply bar */}
          {replyTo && (
            <div className="flex items-center gap-3 px-4 py-2 border-l-4 border-[#00a884]" style={{ background: '#202c33' }}>
              <CornerUpLeft className="w-4 h-4 text-[#00a884] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#00a884] font-medium">{replyTo.direction === 'outbound' ? 'You' : selectedConversation.contact.name}</p>
                <p className="text-xs text-[#8696a0] truncate">{replyTo.content}</p>
              </div>
              <button onClick={() => setReplyTo(null)} className="text-[#8696a0] hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Input bar */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#202c33' }}>
            <button className="text-[#aebac1] p-2 rounded-full hover:bg-[#2a3942]"><Smile className="w-5 h-5" /></button>
            <button className="text-[#aebac1] p-2 rounded-full hover:bg-[#2a3942]"><Paperclip className="w-5 h-5" /></button>
            <div className="flex-1 rounded-lg px-4 py-2" style={{ background: '#2a3942' }}>
              <input
                ref={inputRef}
                className="w-full bg-transparent text-[#e9edef] text-sm placeholder-[#8696a0] outline-none"
                placeholder="Type a message"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              />
            </div>
            <button onClick={handleSendTemplate} disabled={sendingTemplate} title="Send Admission Enquiry Template" className="p-2 rounded-full hover:bg-[#2a3942] text-[#aebac1] disabled:opacity-50">
              <FileText className="w-5 h-5" />
            </button>
            <button onClick={handleSendMessage} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#00a884' }}>
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center gap-4" style={{ background: '#222e35' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#2a3942' }}>
            <MessageSquare className="w-10 h-10 text-[#8696a0]" />
          </div>
          <div className="text-center">
            <p className="text-[#e9edef] text-xl font-light">Enlighted</p>
            <p className="text-[#8696a0] text-sm mt-1">Select a chat to start messaging</p>
          </div>
        </div>
      )}

      {/* ── Context Menu ── */}
      {contextMenu && (
        <div
          className="fixed z-50 rounded-lg shadow-xl py-1 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x, background: '#233138' }}
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { icon: Reply, label: 'Reply', action: () => handleReply(contextMenu.message) },
            { icon: Forward, label: 'Forward', action: () => handleForward(contextMenu.message) },
            { icon: Copy, label: 'Copy', action: () => handleCopy(contextMenu.message) },
            { icon: Star, label: starredIds.has(contextMenu.message.id) ? 'Unstar' : 'Star', action: () => handleStar(contextMenu.message) },
            { icon: Trash2, label: 'Delete', action: () => handleDelete(contextMenu.message), danger: true },
          ].map(({ icon: Icon, label, action, danger }) => (
            <button
              key={label}
              onClick={action}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#2a3942] transition-colors ${danger ? 'text-red-400' : 'text-[#e9edef]'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Forward Modal ── */}
      {forwardMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setForwardMsg(null)}>
          <div className="rounded-xl p-5 w-80 max-h-96 overflow-y-auto" style={{ background: '#233138' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-medium">Forward to</p>
              <button onClick={() => setForwardMsg(null)} className="text-[#8696a0]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-1">
              {conversations.map((conv: any) => (
                <button
                  key={conv.contactId}
                  onClick={async () => {
                    try { await api.whatsappSend(conv.contactId, forwardMsg.content); }
                    catch { store.sendMessage(conv.contactId, forwardMsg.content); }
                    setForwardMsg(null);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2a3942] text-left"
                >
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className={`${getAvatarColor(conv.contact.name)} text-white text-xs`}>
                      {getInitials(conv.contact.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm">{conv.contact.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
