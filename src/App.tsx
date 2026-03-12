import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
const BASENAME = '/minyan';
import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
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

  // Set document title for mydavid.io/minyan
  useEffect(() => {
    document.title = 'Minyan Finder - mydavid.io';
  }, []);

  // Enable push notifications
  usePushNotifications();

  return (
    <Router basename={BASENAME}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/synagogues" element={<Synagogues />} />
        <Route path="/sidour" element={<Sidour />} />
      </Routes>
      <Toaster position="top-right" richColors />
      <ShabbatModal />
      
      {/* Floating Buttons - Mobile optimized */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-40 md:bottom-6 md:right-6">
        <Button
          onClick={() => setOrganizerOpen(true)}
          className="rounded-full shadow-lg text-sm md:text-base px-3 md:px-4"
          size="sm"
          variant="secondary"
        >
          <LayoutDashboard className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Organisateur</span>
          <span className="sm:hidden">Org</span>
        </Button>
        
        <Button
          onClick={() => setRabbiChatOpen(true)}
          className="rounded-full shadow-lg text-sm md:text-base px-3 md:px-4"
          size="sm"
        >
          <BookOpen className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
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
