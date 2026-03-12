import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from '@/pages/Index';
import Synagogues from '@/pages/Synagogues';
import Sidour from '@/pages/Sidour';
import ShabbatModal from '@/components/ShabbatModal';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/synagogues" element={<Synagogues />} />
        <Route path="/sidour" element={<Sidour />} />
      </Routes>
      <Toaster position="top-right" richColors />
      <ShabbatModal />
    </Router>
  );
}

export default App;
