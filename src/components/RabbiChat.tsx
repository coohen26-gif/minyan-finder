import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, BookOpen, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { searchHalakha, HalakhaEntry } from '@/data/halakhaDatabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fromDatabase?: boolean;
}

interface RabbiChatProps {
  isOpen: boolean;
  onClose: () => void;
}

// Réponses par langue quand pas de réponse dans la base
const fallbackResponses = {
  fr: 'Désolé, je n\'ai pas trouvé de réponse à cette question dans ma base de données. Je vous recommande de consulter un Rav local pour une réponse personnalisée.',
  en: 'Sorry, I could not find an answer to this question in my database. I recommend consulting a local Rabbi for a personalized answer.',
  he: 'מצטער, לא מצאתי תשובה לשאלה זו במסד הנתונים שלי. אני ממליץ להתייעץ עם רב מקומי לתשובה אישית.'
};

export function RabbiChat({ isOpen, onClose }: RabbiChatProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as 'fr' | 'en' | 'he';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: currentLang === 'he' 
        ? 'שלום! אני כאן לעזור לך בשאלות הלכה. אני מצטט תמיד את מקורותי.'
        : currentLang === 'en'
        ? 'Hello! I am here to help you with Halakha questions. I always cite my sources precisely.'
        : 'Bonjour ! Je suis là pour vous aider sur les questions de Halakha. Je cite toujours mes sources avec précision.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [databaseResults, setDatabaseResults] = useState<HalakhaEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsLoading(true);

    // Search in local database only (no API for now)
    const localResults = searchHalakha(input.trim(), currentLang);
    setDatabaseResults(localResults);

    let response = '';
    let fromDatabase = false;

    if (localResults.length > 0) {
      // Use database result in the correct language
      const bestMatch = localResults[0];
      
      if (currentLang === 'he') {
        response = bestMatch.answer_he;
        response += `\n\n📚 מקור: ${bestMatch.source} ${bestMatch.source_ref}`;
        if (bestMatch.ashkenazi_custom || bestMatch.sephardi_custom) {
          response += `\n\n🌍 הבדלי מנהגים:`;
          if (bestMatch.ashkenazi_custom) response += `\n- אשכנז: ${bestMatch.ashkenazi_custom}`;
          if (bestMatch.sephardi_custom) response += `\n- ספרד: ${bestMatch.sephardi_custom}`;
        }
        response += `\n\n⭐ רמה: ${bestMatch.level === 'chova' ? 'חובה' : bestMatch.level === 'choumra' ? 'חומרה' : 'מנהג'}`;
      } else if (currentLang === 'en') {
        response = bestMatch.answer;
        response += `\n\n📚 Source: ${bestMatch.source} ${bestMatch.source_ref}`;
        if (bestMatch.ashkenazi_custom || bestMatch.sephardi_custom) {
          response += `\n\n🌍 Custom differences:`;
          if (bestMatch.ashkenazi_custom) response += `\n- Ashkenazi: ${bestMatch.ashkenazi_custom}`;
          if (bestMatch.sephardi_custom) response += `\n- Sephardi: ${bestMatch.sephardi_custom}`;
        }
        response += `\n\n⭐ Level: ${bestMatch.level === 'chova' ? 'Obligation' : bestMatch.level === 'choumra' ? 'Stringency' : 'Custom'}`;
      } else {
        // French
        response = bestMatch.answer;
        response += `\n\n📚 Source : ${bestMatch.source} ${bestMatch.source_ref}`;
        if (bestMatch.ashkenazi_custom || bestMatch.sephardi_custom) {
          response += `\n\n🌍 Différences de coutumes :`;
          if (bestMatch.ashkenazi_custom) response += `\n- Ashkénaze : ${bestMatch.ashkenazi_custom}`;
          if (bestMatch.sephardi_custom) response += `\n- Séfarade : ${bestMatch.sephardi_custom}`;
        }
        response += `\n\n⭐ Niveau : ${bestMatch.level === 'chova' ? 'Obligation' : bestMatch.level === 'choumra' ? 'Stringence' : 'Coutume'}`;
      }
      
      fromDatabase = true;
    } else {
      // No match found - respond in current language only
      response = fallbackResponses[currentLang];
    }

    setMessages(prev => prev.filter(m => m.id !== 'loading'));
    
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      fromDatabase,
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

  // Update welcome message when language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{
          id: 'welcome',
          role: 'assistant',
          content: currentLang === 'he' 
            ? 'שלום! אני כאן לעזור לך בשאלות הלכה. אני מצטט תמיד את מקורותי.'
            : currentLang === 'en'
            ? 'Hello! I am here to help you with Halakha questions. I always cite my sources precisely.'
            : 'Bonjour ! Je suis là pour vous aider sur les questions de Halakha. Je cite toujours mes sources avec précision.',
        }];
      }
      return prev;
    });
  }, [currentLang]);

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
                {currentLang === 'he' ? 'שאל את הרב' : currentLang === 'en' ? 'Ask the Rabbi' : 'Rav - Questions de Halakha'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {currentLang === 'he' 
                  ? 'שירות חינם - מומחה בשולחן ערוך'
                  : currentLang === 'en'
                  ? 'Free service - Shulchan Aruch expert'
                  : 'Service gratuit - Expert Choulhan Aroukh'}
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
              {currentLang === 'he'
                ? 'לפני פסק הלכה מעשי, יש להתייעץ עם רב מקומי.'
                : currentLang === 'en'
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
                  {msg.id === 'loading' ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {currentLang === 'he' ? 'מחפש...' : currentLang === 'en' ? 'Searching...' : 'Recherche...'}
                    </div>
                  ) : (
                    <div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.fromDatabase && (
                        <div className="mt-2 pt-2 border-t border-dashed flex items-center gap-1 text-xs text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          {currentLang === 'he' ? 'מתוך מסד הנתונים המקומי' : currentLang === 'en' ? 'From local database' : 'Depuis la base de données locale'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Database results suggestion */}
        {databaseResults.length > 0 && (
          <div className="px-4 py-2 border-t bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">
              {currentLang === 'he' ? 'תוצאות ממסד הנתונים:' : currentLang === 'en' ? 'Database results:' : 'Résultats de la base :'}
            </p>
            <div className="flex flex-wrap gap-2">
              {databaseResults.slice(0, 3).map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    setInput(currentLang === 'he' ? result.question_he : result.question);
                    handleSend();
                  }}
                  className="text-xs bg-background border rounded-full px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {currentLang === 'he' ? result.question_he : result.question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                currentLang === 'he'
                  ? 'שאל שאלת הלכה...'
                  : currentLang === 'en'
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
              {currentLang === 'he' ? 'מסד נתונים מקומי בלבד' : currentLang === 'en' ? 'Local database only' : 'Base locale uniquement'}
            </p>
            <Badge variant="outline" className="text-xs bg-amber-50">
              🕊️ {currentLang === 'he' ? 'שירות חינם' : currentLang === 'en' ? 'Free service' : 'Service gratuit'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RabbiChat;
