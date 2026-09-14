import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import {
  HomePage,
  ModulePage,
  ComparePage,
  PracticePage,
  LoginPage,
  RegisterPage,
  NotFoundPage,
  AIAssistantPage,
} from './pages';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/module/:id" element={<ModulePage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/practice/:id" element={<PracticePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          {/* Catch-all for unknown routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
