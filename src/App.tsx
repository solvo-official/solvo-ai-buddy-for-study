import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import type { AppTab } from './components/Sidebar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { HomeView } from './components/HomeView.tsx';
import { ScanModal } from './components/ScanModal.tsx';
import { SolutionView } from './components/SolutionView.tsx';
import { TutorView } from './components/TutorView.tsx';
import { QuizView } from './components/QuizView.tsx';
import { NotesView } from './components/NotesView.tsx';
import { FlashcardsView } from './components/FlashcardsView.tsx';
import { PlannerView } from './components/PlannerView.tsx';
import { ProgressView } from './components/ProgressView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { UpgradeModal } from './components/UpgradeModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AuthGateView } from './components/AuthGateView.tsx';
import type { SolvedQuestion } from './types/index.ts';

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [activeQuestion, setActiveQuestion] = useState<SolvedQuestion | null>(null);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [tutorPrompt, setTutorPrompt] = useState<string | undefined>(undefined);

  const handleSelectTab = (tab: AppTab) => {
    setActiveQuestion(null);
    if (tab === 'scan') {
      setIsScanOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  const handleSolutionGenerated = (solution: SolvedQuestion) => {
    setActiveQuestion(solution);
  };

  const handleAskFollowUp = (q: SolvedQuestion) => {
    setActiveQuestion(null);
    setTutorPrompt(`Can you explain this further? Question: "${q.questionText}" and solution step 1.`);
    setCurrentTab('tutor');
  };

  const handleGenerateFlashcardsFromNote = (_text: string) => {
    setActiveQuestion(null);
    setCurrentTab('flashcards');
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg-app)',
          color: 'var(--text-primary)',
        }}
      >
        <div
          className="pulsing-glow"
          style={{
            width: 54,
            height: 54,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.4rem',
            marginBottom: '16px',
          }}
        >
          S
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>Solvo</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading your study buddy...</p>
      </div>
    );
  }

  // Mandatory Authentication Gate: require user to sign in with their Gmail
  if (!user) {
    return <AuthGateView />;
  }

  return (
    <div className="app-container">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Header
          onOpenUpgrade={() => setIsUpgradeOpen(true)}
          onOpenProfile={() => handleSelectTab('profile')}
          onOpenScan={() => setIsScanOpen(true)}
        />

        <main style={{ flex: 1, padding: 'var(--space-2) 0' }}>
          {/* If a question solution is active, display SolutionView */}
          {activeQuestion ? (
            <SolutionView
              question={activeQuestion}
              onBack={() => setActiveQuestion(null)}
              onAskFollowUp={handleAskFollowUp}
            />
          ) : currentTab === 'home' ? (
            <HomeView
              onNavigate={handleSelectTab}
              onOpenScan={() => setIsScanOpen(true)}
              onSelectQuestion={(q) => setActiveQuestion(q)}
            />
          ) : currentTab === 'tutor' ? (
            <TutorView initialPrompt={tutorPrompt} />
          ) : currentTab === 'quizzes' ? (
            <QuizView />
          ) : currentTab === 'notes' ? (
            <NotesView onGenerateFlashcards={handleGenerateFlashcardsFromNote} />
          ) : currentTab === 'flashcards' ? (
            <FlashcardsView />
          ) : currentTab === 'planner' ? (
            <PlannerView />
          ) : currentTab === 'progress' ? (
            <ProgressView
              onSelectQuestion={(q) => setActiveQuestion(q)}
              onNavigateToQuiz={() => handleSelectTab('quizzes')}
            />
          ) : (
            <ProfileView
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenScan={() => setIsScanOpen(true)}
      />

      {/* Smart Scan Modal */}
      <ScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onSolutionGenerated={handleSolutionGenerated}
      />

      {/* Upgrade to Pro Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
