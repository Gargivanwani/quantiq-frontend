import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import Dashboard from './pages/Dashboard';
import TopicLibrary from './pages/TopicLibrary';
import FormulaSheet from './pages/FormulaSheet';
import FlashcardHub, { ReviewSession } from './pages/Flashcards';
import ProblemBank from './pages/ProblemBank';
import ResourceHub from './pages/ResourceHub';
import NotesEditor from './pages/NotesEditor';
import ProgressTracker from './pages/ProgressTracker';
import QuantChatbot from './pages/QuantChatbot';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/topics" element={<TopicLibrary />} />
          <Route path="/formulas" element={<FormulaSheet />} />
          <Route path="/flashcards" element={<FlashcardHub />} />
          <Route path="/flashcards/:deckId" element={<ReviewSession />} />
          <Route path="/problems" element={<ProblemBank />} />
          <Route path="/resources" element={<ResourceHub />} />
          <Route path="/notes" element={<NotesEditor />} />
          <Route path="/progress" element={<ProgressTracker />} />
          <Route path="/chatbot" element={<QuantChatbot />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
