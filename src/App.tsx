import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from '@/pages/Index';
import Synagogues from '@/pages/Synagogues';
import Sidour from '@/pages/Sidour';
import ShabbatModal from '@/components/ShabbatModal';
import { Button } from '@/components/ui/button';
import { BookOpen, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import RabbiChat from '@/components/RabbiChat';
import OrganizerDashboard from '@/components/OrganizerDashboard';

function App() {
  const [rabbiChatOpen, setRabbiChatOpen] = useState(false);
  const [organizerOpen, setOrganizerOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/synagogues" element={<Synagogues />} />
        <Route path="/sidour" element={<Sidour />} />
      </Routes>
      <Toaster position="top-right" richColors />
      <ShabbatModal />
      
      {/* Floating Buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-40">
        <Button
          onClick={() => setOrganizerOpen(true)}
          className="rounded-full shadow-lg"
          size="lg"
          variant="secondary"
        >
          <LayoutDashboard className="h-5 w-5 mr-2" />
          Organisateur
        </Button>
        
        <Button
          onClick={() => setRabbiChatOpen(true)}
          className="rounded-full shadow-lg"
          size="lg"
        >
          <BookOpen className="h-5 w-5 mr-2" />
          Rav
        </Button>
      </div>

      <RabbiChat 
        isOpen={rabbiChatOpen} 
        onClose={() => setRabbiChatOpen(false)} 
      />
      
      <OrganizerDashboard
        isOpen={organizerOpen}
        onClose={() => setOrganizerOpen(false)}
      />
    </Router>
  );
}

export default App;
