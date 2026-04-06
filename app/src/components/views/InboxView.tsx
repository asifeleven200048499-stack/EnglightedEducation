import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  CheckCheck,
  Check,
  Phone,
  Video,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getInitials, getAvatarColor, formatRelativeTime } from '@/lib/utils';
import type { Message } from '@/types';

interface InboxViewProps {
  store: any;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatConvDate(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 24 * 60 * 60 * 1000) return formatTime(date);
  if (diff < 7 * 24 * 60 * 60 * 1000)
    return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function InboxView({ store }: InboxViewProps) {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = () => {
    if (messageText.trim() && selectedContactId) {
      store.sendMessage(selectedContactId, messageText.trim());
      setMessageText('');
    }
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages?.length]);

  const MessageTick = ({ message }: { message: Message }) => {
    if (message.direction !== 'outbound') return null;
    if (message.status === 'read')
      return <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />;
    if (message.status === 'delivered')
      return <CheckCheck className="w-3.5 h-3.5 text-[#8696a0]" />;
    return <Check className="w-3.5 h-3.5 text-[#8696a0]" />;
  };

  return (
    <div
      className="flex h-[calc(100vh-140px)] rounded-lg overflow-hidden border border-slate-200"
      style={{ background: '#111b21' }}
    >
      {/* Left panel — conversation list */}
      <div
        className={`flex flex-col border-r border-[#2a3942] ${
          showMobileChat ? 'hidden md:flex' : 'flex'
        }`}
        style={{ width: '100%', maxWidth: 360, background: '#111b21', flexShrink: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ background: '#202c33' }}>
          <span className="text-white font-semibold text-base">Chats</span>
        </div>

        {/* Search */}
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

        {/* Conversation list */}
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
                onClick={() => handleSelectContact(conv.contactId)}
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
                    {lastMsg && (
                      <span className="text-xs text-[#8696a0] ml-2 flex-shrink-0">
                        {formatConvDate(lastMsg.sentAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {lastMsg?.direction === 'outbound' && <MessageTick message={lastMsg} />}
                    <p className="text-sm text-[#8696a0] truncate flex-1">
                      {lastMsg?.content ?? 'No messages'}
                    </p>
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

      {/* Right panel — chat */}
      {selectedConversation ? (
        <div className={`flex-1 flex flex-col min-w-0 ${
          showMobileChat ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Chat header */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ background: '#202c33' }}
          >
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded-full hover:bg-[#2a3942] transition-colors text-[#aebac1]"
                onClick={handleBackToList}
              >
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
            <div className="flex items-center gap-2 text-[#aebac1]">
              <button className="p-2 rounded-full hover:bg-[#2a3942] transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-[#2a3942] transition-colors">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-[#2a3942] transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-[#2a3942] transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto px-16 py-4 space-y-1"
            style={{
              background: '#0b141a',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='400' fill='%230b141a'/%3E%3C/svg%3E")`
            }}
          >
            {[...selectedConversation.messages].sort(
              (a: Message, b: Message) => a.sentAt.getTime() - b.sentAt.getTime()
            ).map((message: Message) => {
              const isOut = message.direction === 'outbound';
              return (
                <div key={message.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'} mb-1`}>
                  <div
                    className="relative max-w-[65%] px-3 py-2 rounded-lg shadow-sm"
                    style={{
                      background: isOut ? '#005c4b' : '#202c33',
                      borderRadius: isOut ? '8px 0 8px 8px' : '0 8px 8px 8px'
                    }}
                  >
                    {/* tail */}
                    <div
                      className="absolute top-0 w-2 h-2"
                      style={{
                        [isOut ? 'right' : 'left']: -6,
                        borderTop: `8px solid ${isOut ? '#005c4b' : '#202c33'}`,
                        borderLeft: isOut ? '8px solid transparent' : 'none',
                        borderRight: isOut ? 'none' : '8px solid transparent',
                      }}
                    />
                    <p className="text-[#e9edef] text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-[#8696a0]">{formatTime(message.sentAt)}</span>
                      <MessageTick message={message} />
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: '#202c33' }}
          >
            <button className="text-[#aebac1] p-2 rounded-full hover:bg-[#2a3942] transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button className="text-[#aebac1] p-2 rounded-full hover:bg-[#2a3942] transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 rounded-lg px-4 py-2" style={{ background: '#2a3942' }}>
              <input
                className="w-full bg-transparent text-[#e9edef] text-sm placeholder-[#8696a0] outline-none"
                placeholder="Type a message"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ background: '#00a884' }}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className="flex-1 hidden md:flex flex-col items-center justify-center gap-4"
          style={{ background: '#222e35' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: '#2a3942' }}
          >
            <MessageSquare className="w-10 h-10 text-[#8696a0]" />
          </div>
          <div className="text-center">
            <p className="text-[#e9edef] text-xl font-light">Enlighted</p>
            <p className="text-[#8696a0] text-sm mt-1">Select a chat to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
