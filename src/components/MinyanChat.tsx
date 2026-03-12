import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Minyan } from '@/lib/api';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: Date;
}

interface MinyanChatProps {
  minyan: Minyan;
  isOpen: boolean;
  onClose: () => void;
  users: Record<string, { name: string; avatar: string }>;
  currentUserId: string;
}

export function MinyanChat({ minyan, isOpen, onClose, users, currentUserId }: MinyanChatProps) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock initial messages
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const creator = users[minyan.created_by] || { name: 'Créateur', avatar: 'CR' };
      setMessages([
        {
          id: '1',
          userId: minyan.created_by,
          userName: creator.name,
          userAvatar: creator.avatar,
          message: i18n.language === 'he' 
            ? 'ברוכים הבאים לשולחן המניין!'
            : i18n.language === 'en'
            ? 'Welcome to the Minyan table!'
            : 'Bienvenue à la table de Minyan !',
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: '2',
          userId: 'system',
          userName: 'Système',
          userAvatar: 'SYS',
          message: i18n.language === 'he'
            ? `השולחן: ${minyan.participants.length}/10`
            : i18n.language === 'en'
            ? `Table: ${minyan.participants.length}/10`
            : `Table : ${minyan.participants.length}/10`,
          timestamp: new Date(Date.now() - 1800000),
        },
      ]);
    }
  }, [isOpen, minyan, users, i18n.language, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const currentUser = users[currentUserId] || { name: 'Moi', avatar: 'MOI' };
    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      message: newMessage.trim(),
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
  };

  const shareOnWhatsApp = () => {
    const text = i18n.language === 'he'
      ? `הצטרפו למניין ב-${minyan.location}! ${minyan.participants.length}/10 כבר רשומים. קישור: https://minyan.app/t/${minyan.id}`
      : i18n.language === 'en'
      ? `Join the Minyan at ${minyan.location}! ${minyan.participants.length}/10 already registered. Link: https://minyan.app/t/${minyan.id}`
      : `Rejoignez le Minyan à ${minyan.location} ! ${minyan.participants.length}/10 déjà inscrits. Lien : https://minyan.app/t/${minyan.id}`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">
                {i18n.language === 'he' ? 'צ׳אט המניין' : i18n.language === 'en' ? 'Minyan Chat' : 'Chat du Minyan'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {minyan.location} • {minyan.participants.length}/10
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={shareOnWhatsApp} className="gap-1">
              <Phone className="h-4 w-4" />
              WhatsApp
            </Button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.userId === currentUserId ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs bg-primary/10">
                  {msg.userAvatar}
                </AvatarFallback>
              </Avatar>
              <div className={`max-w-[80%] ${msg.userId === currentUserId ? 'text-right' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {msg.userName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div
                  className={`inline-block px-3 py-2 rounded-lg text-sm ${
                    msg.userId === currentUserId
                      ? 'bg-primary text-primary-foreground'
                      : msg.userId === 'system'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-muted'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                i18n.language === 'he'
                  ? 'כתוב הודעה...'
                  : i18n.language === 'en'
                  ? 'Type a message...'
                  : 'Écrivez un message...'
              }
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {i18n.language === 'he'
              ? 'הודעות נשלחות רק למשתתפי המניין'
              : i18n.language === 'en'
              ? 'Messages are only sent to Minyan participants'
              : 'Les messages sont envoyés uniquement aux participants du Minyan'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MinyanChat;
