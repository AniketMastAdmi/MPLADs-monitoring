import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { MapViewPage } from './pages/MapViewPage';
import { AuthorityQueuePage } from './pages/AuthorityQueuePage';
import { MpDirectoryPage } from './pages/MpDirectoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { AdminImportPage } from './pages/AdminImportPage';

export function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [userRole, setUserRole] = useState('Citizen');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [exploreSearchParam, setExploreSearchParam] = useState<string>('');
  const [reportInitialProjectId, setReportInitialProjectId] = useState<string>('');

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateExplore = (searchParam = '') => {
    setExploreSearchParam(searchParam);
    setCurrentTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReportIssue = (projectId = '') => {
    setReportInitialProjectId(projectId);
    setCurrentTab('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'explore') {
      setExploreSearchParam('');
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gov-bg text-gov-charcoal selection:bg-gov-blue selection:text-white">
      {/* Official Government Portal Header */}
      <Header
        currentTab={currentTab}
        onTabChange={handleTabChange}
        userRole={userRole}
        onRoleChange={setUserRole}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-0">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={(tab, filter) => {
              if (tab === 'explore') {
                handleNavigateExplore(filter || '');
              } else if (tab === 'report') {
                handleReportIssue();
              } else {
                handleTabChange(tab);
              }
            }}
            onSelectProject={handleSelectProject}
          />
        )}

        {currentTab === 'explore' && (
          <ExplorePage
            initialSearch={exploreSearchParam}
            onSelectProject={handleSelectProject}
          />
        )}

        {currentTab === 'detail' && selectedProjectId && (
          <ProjectDetailPage
            projectId={selectedProjectId}
            onBack={() => setCurrentTab('explore')}
            onReportIssue={(pId) => handleReportIssue(pId)}
            onSelectProject={handleSelectProject}
          />
        )}

        {currentTab === 'map' && (
          <MapViewPage onSelectProject={handleSelectProject} />
        )}

        {currentTab === 'queue' && (
          <AuthorityQueuePage onSelectProject={handleSelectProject} />
        )}

        {currentTab === 'mps' && (
          <MpDirectoryPage onSelectProject={handleSelectProject} />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsPage
            onSelectProject={handleSelectProject}
            onNavigateExplore={handleNavigateExplore}
          />
        )}

        {currentTab === 'report' && (
          <ReportIssuePage
            initialProjectId={reportInitialProjectId}
            onSelectProject={handleSelectProject}
          />
        )}

        {currentTab === 'admin' && (
          <AdminImportPage />
        )}
      </main>

      {/* Mobile-First Sticky Bottom Nav */}
      <MobileBottomNav currentTab={currentTab} onTabChange={handleTabChange} />

      {/* Official Government Footer */}
      <Footer />
    </div>
  );
}

export default App;
