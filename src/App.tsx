
import './App.css';
import { useEffect } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import LandingPage from './pages';
import CategoryPage from './pages/category/[id]';
import EntryAnimationPage from './pages/EntryAnimationPage';
import DesignSystemDemo from './pages/DesignSystemDemo';
import { bootstrapApplication } from './utils/bootstrap/appBootstrap';

function App() {
  // Bootstrap the application at startup
  useEffect(() => {
    bootstrapApplication();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/entry" element={<EntryAnimationPage />} />
        <Route path="/design" element={<DesignSystemDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
