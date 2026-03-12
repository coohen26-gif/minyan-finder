import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from '@/pages/Index';
import Synagogues from '@/pages/Synagogues';
import Sidour from '@/pages/Sidour';
import ShabbatModal from '@/components/ShabbatModal';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import RabbiChat from '@/components/RabbiChat';

function App() {
  const [rabbiChatOpen, setRabbiChatOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/synagogues" element={<Synagogues />} />
        <Route path="/sidour" element={<Sidour />} />
      </Routes>
      <Toaster position="top-right" richColors />
      <ShabbatModal />
      
      {/* Floating Rabbi Chat Button */}
      <Button
        onClick={() => setRabbiChatOpen(true)}
        className="fixed bottom-4 right-4 rounded-full shadow-lg z-40"
        size="lg"
      >
        <BookOpen className="h-5 w-5 mr-2" />
        Rav
      </Button>

      <RabbiChat 
        isOpen={rabbiChatOpen} 
        onClose={() => setRabbiChatOpen(false)} 
      />
    </Router>
  );
}

export default App;
