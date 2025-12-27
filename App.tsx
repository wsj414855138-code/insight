import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AudioAnalyzer from './components/AudioAnalyzer';
import SurveyGenerator from './components/SurveyGenerator';
import ReportBuilder from './components/ReportBuilder';
import { ViewState } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'audio':
        return <AudioAnalyzer />;
      case 'survey':
        return <SurveyGenerator />;
      case 'report':
        return <ReportBuilder />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    >
      {renderView()}
    </Layout>
  );
}

export default App;