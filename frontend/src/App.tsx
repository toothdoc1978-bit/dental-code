import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VisitWorkspace from './pages/VisitWorkspace';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <div className="header-left">
            <h1 className="app-title">Clinical Sidecar</h1>
            <span className="app-subtitle">Bastrop Dental Care</span>
          </div>
          <div className="header-right">
            <span className="provider-badge">Dr. Chad Gardner, DDS</span>
            <span className="version-badge">v2.0</span>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<VisitWorkspace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
