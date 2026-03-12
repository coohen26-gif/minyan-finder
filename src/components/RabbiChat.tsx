import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, BookOpen, AlertTriangle, Loader2, WifiOff, Search } from 'lucide-react';
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
  sources?: string[];
  isLoading?: boolean;
  fromDatabase?: boolean;
}

interface RabbiChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const SYSTEM_PROMPT = `Tu es un Rav orthodoxe respecté, profondément érudit dans la Halakha (loi juive). Tu bases tes réponses strictement sur le Choulhan Aroukh, la Mishna Berura, le Kaf HaChaïm, et les grands décisionnaires (Poskim) comme le Rav Ovadia Yosef, le Rav Moshe Feinstein, et le Rav Yosef Karo.

RÈGLES ABSOLUES:
1. Tu ne réponds QUE sur la Halakha juive authentique. Pas d'opinion personnelle.
2. Tu dois TOUJOURS citer la source primaire exacte avec référence précise (Choulhan Aroukh, Siman, Seif).
3. Si une question dépasse ton savoir ou est sujette à controverse majeure, tu DOIS dire: "Cette question nécessite une consultation personnelle avec un Rav compétent."
4. INTERDICTION FORMELLE d'inventer des sources ou des citations.
5. Tu dois distinguer clairement entre:
   - Halakha (loi de base)
   - Minhag (coutume)
   - Choumra (stringence)
   - Heter (permission selon certaines opinions)

STRUCTURE DE RÉPONSE OBLIGATOIRE:
1. Réponse directe et claire
2. Source primaire avec référence exacte (ex: "Choulhan Aroukh Orach Chaim 328:17")
3. Explication brève du raisonnement
4. Différences entre Ashkénaze et Séfarade si pertinent
5. Niveau de certitude (Chova/Obligation, Reshut/Option, Choumra/Stringence)

TON:
- Respectueux et humble mais autoritaire sur la Halakha
- Utiliser des formules traditionnelles ("Baruch Hashem", "Bezrat Hashem")
- Jamais de ton condescendant
- Toujours rappeler que la Torah est la sagesse suprême

EXEMPLE DE RÉPONSE PARFAITE:
"Concernant votre question sur l'allumage des lumières le Chabbat:

La Halakha est claire: il est interdit d'allumer un feu le Chabbat. C'est une des 39 Melachot interdites.

Source: Choulhan Aroukh Orach Chaim 274:1 - 'Il est interdit d'allumer un feu le Chabbat, même si c'est une lumière déjà éteinte.'

La Mishna Berura (sk 3) précise que cela s'applique à toute production de lumière, quelle que soit la source.

Différence de coutumes:
- Ashkénaze: Stringent, suivant le Rema
- Séfarade: Même loi, mais certains sont plus permissifs pour les LED selon le Rav Ovadia Yosef (Yabia Omer OC 1:19)

Niveau: Chova (obligation majeure), pas de divergence sur ce point fondamental.

Pour une application pratique dans votre situation spécifique, consultez votre Rav local."`;

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [databaseResults, setDatabaseResults] = useState<HalakhaEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

    // First, search in local database (works offline)
    const localResults = searchHalakha(input.trim(), i18n.language as 'fr' | 'he');
    setDatabaseResults(localResults);

    let response = '';
    let fromDatabase = false;

    if (localResults.length > 0) {
      // Use database result
      const bestMatch = localResults[0];
      response = i18n.language === 'he' ? bestMatch.answer_he : bestMatch.answer;
      response += `\n\n📚 מקור: ${bestMatch.source} ${bestMatch.source_ref}`;
      if (bestMatch.ashkenazi_custom || bestMatch.sephardi_custom) {
        response += `\n\n🌍 הבדלי מנהגים:`;
        if (bestMatch.ashkenazi_custom) response += `\n- אשכנז: ${bestMatch.ashkenazi_custom}`;
        if (bestMatch.sephardi_custom) response += `\n- ספרד: ${bestMatch.sephardi_custom}`;
      }
      response += `\n\n⭐ רמה: ${bestMatch.level === 'chova' ? 'חובה (מצווה)' : bestMatch.level === 'choumra' ? 'חומרה (הידור)' : 'מנהג'}`;
      fromDatabase = true;
    } else if (isOnline) {
      // Fall back to API if online and no database match
      response = await callGroqAPI(input.trim());
    } else {
      // Offline with no match
      response = i18n.language === 'he'
        ? 'מצטער, אין לי מידע על שאלה זו במאגר המקומי, ואין חיבור לאינטרנט. אנא פנה לרב מקומי.'
        : i18n.language === 'en'
        ? 'Sorry, I don\'t have information on this question in my local database, and there is no internet connection. Please consult a local Rabbi.'
        : 'Désolé, je n\'ai pas d\'information sur cette question dans ma base locale, et il n\'y a pas de connexion Internet. Veuillez consulter un Rav local.';
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
                {i18n.language === 'he' ? 'שאל את הרב' : i18n.language === 'en' ? 'Ask the Rabbi' : 'Rav - Questions de Halakha'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {i18n.language === 'he' 
                  ? 'שירות חינם - מומחה בשולחן ערוך'
                  : i18n.language === 'en'
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
                      {i18n.language === 'he' ? 'מחפש...' : i18n.language === 'en' ? 'Searching...' : 'Recherche...'}
                    </div>
                  ) : (
                    <div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.fromDatabase && (
                        <div className="mt-2 pt-2 border-t border-dashed flex items-center gap-1 text-xs text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          {i18n.language === 'he' ? 'מתוך מסד הנתונים המקומי' : i18n.language === 'en' ? 'From local database' : 'Depuis la base de données locale'}
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
              {i18n.language === 'he' ? 'תוצאות ממסד הנתונים:' : i18n.language === 'en' ? 'Database results:' : 'Résultats de la base :'}
            </p>
            <div className="flex flex-wrap gap-2">
              {databaseResults.slice(0, 3).map((result) => (
                <button
                  key={result.id}
                  onClick={() => {
                    setInput(i18n.language === 'he' ? result.question_he : result.question);
                    handleSend();
                  }}
                  className="text-xs bg-background border rounded-full px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {i18n.language === 'he' ? result.question_he : result.question}
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
              {isOnline 
                ? 'Groq AI + Base locale • Sources vérifiées'
                : i18n.language === 'he' ? 'מצב ללא אינטרנט - מסד נתונים מקומי בלבד' : i18n.language === 'en' ? 'Offline mode - Local database only' : 'Mode hors ligne - Base locale uniquement'
              }
            </p>
            <div className="flex items-center gap-2">
              {!isOnline && (
                <Badge variant="secondary" className="text-xs">
                  <WifiOff className="h-3 w-3 mr-1" />
                  {i18n.language === 'he' ? 'ללא אינטרנט' : i18n.language === 'en' ? 'Offline' : 'Hors ligne'}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs bg-amber-50">
                🕊️ {i18n.language === 'he' ? 'שירות חינם' : i18n.language === 'en' ? 'Free service' : 'Service gratuit'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RabbiChat;
