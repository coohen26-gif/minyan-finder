import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from '@/pages/Index';
import Synagogues from '@/pages/Synagogues';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/synagogues" element={<Synagogues />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </Router>
  );
}

export default App;
