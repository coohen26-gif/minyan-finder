import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, BookOpen, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  isLoading?: boolean;
}

interface RabbiChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const SYSTEM_PROMPT = `Tu es un Rav expert en Halakha (loi juive), spécialisé dans le Choulhan Aroukh et les commentaires (Mishna Berura, Kaf HaChaïm, etc.) ainsi que les responsa modernes.

RÈGLES STRICTES:
1. Tu ne réponds QUE sur des sujets de Halakha juive (Chabbat, Kashrout, prières, etc.)
2. Tu dois TOUJOURS citer tes sources précises (Choulhan Aroukh, siman, seif, etc.)
3. Si tu n'es pas sûr à 100%, tu dis "Il faut consulter un Rav local"
4. Tu ne dois JAMAIS inventer de sources
5. Pour Chabbat: citer Choulhan Aroukh Orach Chaim
6. Pour Kashrout: citer Choulhan Aroukh Yoreh Deah
7. Pour les prières: citer Choulhan Aroukh Orach Chaim

Format de réponse:
- Réponse concise
- Source exacte (ex: "Choulhan Aroukh OC 328:17")
- Si applicable: différence entre Ashkénaze et Séfarade
- Mentionner si c'est une stringence (choumra) ou la loi de base`;

export function RabbiChat({ isOpen, onClose }: RabbiChatProps) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: i18n.language === 'he' 
        ? 'שלום! אני כאן לעזור לך בשאלות הלכה. אני מצטט תמיד את מקורותי.'
        : i18n.language === 'en'
        ? 'Hello! I am here to help you with Halakha questions. I always cite my sources precisely.'
        : 'Bonjour ! Je suis là pour vous aider sur les questions de Halakha. Je cite toujours mes sources avec précision.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callGroqAPI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY || ''}`,
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.filter(m => !m.isLoading).map(m => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content: userMessage },
          ],
          temperature: 0.1, // Très bas pour éviter l'invention
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Erreur de réponse';
    } catch (error) {
      console.error('Groq API error:', error);
      return i18n.language === 'he'
        ? 'מצטער, יש בעיה טכנית. אנא פנה לרב מקומי.'
        : i18n.language === 'en'
        ? 'Sorry, there is a technical issue. Please consult a local Rabbi.'
        : 'Désolé, il y a un problème technique. Veuillez consulter un Rav local.';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    const loadingMsg: Message = {
      id: 'loading',
      role: 'assistant',
      content: '',
      isLoading: true,
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsLoading(true);

    const response = await callGroqAPI(input.trim());

    setMessages(prev => prev.filter(m => m.id !== 'loading'));
    
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
    };

    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
        <CardHeader className="border-b flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {i18n.language === 'he' ? 'שאל את הרב' : i18n.language === 'en' ? 'Ask the Rabbi' : 'Demandez au Rav'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {i18n.language === 'he' 
                  ? 'מומחה בשולחן ערוך - מצטט מקורות'
                  : i18n.language === 'en'
                  ? 'Shulchan Aruch expert - cites sources'
                  : 'Expert Choulhan Aroukh - cite les sources'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              {i18n.language === 'he'
                ? 'לפני פסק הלכה מעשי, יש להתייעץ עם רב מקומי.'
                : i18n.language === 'en'
                ? 'Before a practical Halakha ruling, consult a local Rabbi.'
                : 'Avant une décision halakhique pratique, consultez un Rav local.'}
            </p>
          </div>

          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className={msg.role === 'user' ? 'bg-primary' : 'bg-amber-100'}>
                  {msg.role === 'user' ? 'V' : 'ר'}
                </AvatarFallback>
              </Avatar>
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`inline-block px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {i18n.language === 'he' ? 'חושב...' : i18n.language === 'en' ? 'Thinking...' : 'Réflexion...'}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                i18n.language === 'he'
                  ? 'שאל שאלת הלכה...'
                  : i18n.language === 'en'
                  ? 'Ask a Halakha question...'
                  : 'Posez une question de Halakha...'
              }
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Powered by Groq AI • Sources vérifiées
            </p>
            <Badge variant="outline" className="text-xs">
              Choulhan Aroukh
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RabbiChat;
