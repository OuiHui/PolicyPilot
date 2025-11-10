import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { MyCases } from './components/MyCases';
import { CaseDetail } from './components/CaseDetail';
import { DenialUpload } from './components/DenialUpload';
import { PolicyUpload } from './components/PolicyUpload';
import { ExtractedInfo } from './components/ExtractedInfo';
import { AppealStrategy } from './components/AppealStrategy';
import { EmailReview } from './components/EmailReview';
import { EmailSent } from './components/EmailSent';
import { ReplyReceived } from './components/ReplyReceived';
import { FollowupReview } from './components/FollowupReview';
import { Settings } from './components/Settings';
import { Sidebar } from './components/Sidebar';

export type Screen = 
  | 'login'
  | 'dashboard' 
  | 'my-cases'
  | 'case-detail'
  | 'denial-upload'
  | 'policy-upload'
  | 'extracted-info' 
  | 'strategy' 
  | 'email-review' 
  | 'email-sent' 
  | 'reply-received' 
  | 'followup-review'
  | 'settings';

export type CaseStatus = 'uploading' | 'analyzing' | 'ready-to-send' | 'sent' | 'awaiting-reply' | 'reply-received';

export type CaseStep = 'denial-upload' | 'policy-upload' | 'extracted-info' | 'strategy' | 'email-review' | 'email-sent' | 'reply-received' | 'followup-review';

export type Case = {
  id: string;
  insuranceCompany: string;
  denialReasonTitle: string;
  dateCreated: string;
  status: CaseStatus;
  currentStep: CaseStep;
  hasNewEmail: boolean;
  denialFiles: File[];
  policyType: 'comprehensive' | 'supplementary' | null;
  policyFiles: File[];
  parsedData: ParsedData | null;
  emailThread: EmailMessage[];
  resolved?: boolean;
  resolvedDate?: string;
  feedback?: string;
};

export type ParsedData = {
  insurer: string;
  policyNumber: string;
  denialReason: string;
};

export type EmailMessage = {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  type: 'sent' | 'received';
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [cases, setCases] = useState<Case[]>([]);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);

  const getCurrentCase = () => cases.find(c => c.id === currentCaseId);

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    setCurrentScreen('dashboard');
  };

  const handleStartNewAppeal = () => {
    // Create new case
    const newCase: Case = {
      id: Date.now().toString(),
      insuranceCompany: 'Unknown',
      denialReasonTitle: 'Pending Analysis',
      dateCreated: new Date().toISOString(),
      status: 'uploading',
      currentStep: 'denial-upload',
      hasNewEmail: false,
      denialFiles: [],
      policyType: null,
      policyFiles: [],
      parsedData: null,
      emailThread: []
    };
    setCases([...cases, newCase]);
    setCurrentCaseId(newCase.id);
    setCurrentScreen('denial-upload');
  };

  const handleDenialUploadComplete = (files: File[]) => {
    if (!currentCaseId) return;
    setCases(cases.map(c => 
      c.id === currentCaseId 
        ? { ...c, denialFiles: files, currentStep: 'policy-upload' }
        : c
    ));
    setCurrentScreen('policy-upload');
  };

  const handlePolicyUploadComplete = (policyType: 'comprehensive' | 'supplementary', files: File[]) => {
    if (!currentCaseId) return;
    setCases(prevCases => prevCases.map(c => 
      c.id === currentCaseId 
        ? { ...c, policyType, policyFiles: files, status: 'analyzing', currentStep: 'extracted-info' }
        : c
    ));
    
    // Simulate parsing
    setTimeout(() => {
      const parsedData: ParsedData = {
        insurer: 'HealthGuard Insurance Co.',
        policyNumber: 'HG-2024-789456',
        denialReason: 'Service deemed not medically necessary'
      };
      setCases(prevCases => prevCases.map(c => 
        c.id === currentCaseId 
          ? { ...c, parsedData, insuranceCompany: parsedData.insurer, denialReasonTitle: parsedData.denialReason }
          : c
      ));
      setCurrentScreen('extracted-info');
    }, 2000);
  };

  const handleExtractedInfoSave = (data: ParsedData) => {
    if (!currentCaseId) return;
    setCases(cases.map(c => 
      c.id === currentCaseId 
        ? { ...c, parsedData: data, insuranceCompany: data.insurer, denialReasonTitle: data.denialReason, currentStep: 'strategy' }
        : c
    ));
    setCurrentScreen('strategy');
  };

  const handleDraftEmail = (draft: { subject: string; body: string }) => {
    if (!currentCaseId) return;
    setCases(cases.map(c => 
      c.id === currentCaseId 
        ? { ...c, currentStep: 'email-review' }
        : c
    ));
    setCurrentScreen('email-review');
  };

  const handleSendEmail = (message: EmailMessage) => {
    if (!currentCaseId) return;
    setCases(cases.map(c => 
      c.id === currentCaseId 
        ? { ...c, emailThread: [...c.emailThread, message], status: 'awaiting-reply', currentStep: 'email-sent' }
        : c
    ));
    setCurrentScreen('email-sent');
  };

  const handleViewReply = () => {
    // Simulate receiving reply
    if (!currentCaseId) return;
    const reply: EmailMessage = {
      id: Date.now().toString(),
      from: 'claims@healthguard.com',
      to: userEmail,
      subject: 'Re: Appeal for Claim Denial',
      body: 'Insurance company response...',
      date: new Date().toISOString(),
      type: 'received'
    };
    setCases(cases.map(c => 
      c.id === currentCaseId 
        ? { ...c, emailThread: [...c.emailThread, reply], status: 'reply-received', currentStep: 'reply-received', hasNewEmail: true }
        : c
    ));
    setCurrentScreen('reply-received');
  };

  const handleViewCase = (caseId: string) => {
    setCurrentCaseId(caseId);
    setCurrentScreen('case-detail');
  };

  const handleResumeCase = (caseId: string) => {
    const caseToResume = cases.find(c => c.id === caseId);
    if (!caseToResume) return;
    
    setCurrentCaseId(caseId);
    setCurrentScreen(caseToResume.currentStep);
  };

  const handleDeleteCase = (caseId: string) => {
    setCases(cases.filter(c => c.id !== caseId));
    if (currentCaseId === caseId) {
      setCurrentCaseId(null);
      setCurrentScreen('my-cases');
    }
  };

  const handleResolveCase = (caseId: string, feedback?: string) => {
    setCases(cases.map(c => 
      c.id === caseId 
        ? { ...c, resolved: true, resolvedDate: new Date().toISOString(), feedback }
        : c
    ));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setCases([]);
    setCurrentCaseId(null);
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    const currentCase = getCurrentCase();

    switch (currentScreen) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} />;
      case 'my-cases':
        return <MyCases cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} onStartNew={handleStartNewAppeal} onDeleteCase={handleDeleteCase} onResolveCase={handleResolveCase} />;
      case 'case-detail':
        if (!currentCase) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} />;
        return <CaseDetail case={currentCase} onBack={() => setCurrentScreen('my-cases')} onDeleteCase={handleDeleteCase} onResolveCase={handleResolveCase} />;
      case 'denial-upload':
        if (!currentCase) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} />;
        return <DenialUpload 
          initialFiles={currentCase.denialFiles} 
          onContinue={handleDenialUploadComplete} 
          onBack={() => setCurrentScreen('dashboard')} 
        />;
      case 'policy-upload':
        if (!currentCase) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} />;
        return <PolicyUpload 
          initialPolicyType={currentCase.policyType}
          initialFiles={currentCase.policyFiles}
          onComplete={handlePolicyUploadComplete} 
          onBack={() => setCurrentScreen('denial-upload')} 
        />;
      case 'extracted-info':
        if (!currentCase?.parsedData) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} />;
        return <ExtractedInfo data={currentCase.parsedData} onSave={handleExtractedInfoSave} onBack={() => setCurrentScreen('policy-upload')} />;
      case 'strategy':
        if (!currentCase?.parsedData) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} />;
        return <AppealStrategy parsedData={currentCase.parsedData} onDraftEmail={handleDraftEmail} onBack={() => setCurrentScreen('extracted-info')} />;
      case 'email-review':
        if (!currentCase?.parsedData) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} />;
        return <EmailReview userEmail={userEmail} parsedData={currentCase.parsedData} onSend={handleSendEmail} onBack={() => setCurrentScreen('strategy')} />;
      case 'email-sent':
        if (!currentCase) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} />;
        return <EmailSent case={currentCase} onViewReply={handleViewReply} onBackToDashboard={() => setCurrentScreen('dashboard')} />;
      case 'reply-received':
        if (!currentCase) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} />;
        return <ReplyReceived case={currentCase} onDraftFollowup={() => setCurrentScreen('followup-review')} onBack={() => setCurrentScreen('email-sent')} />;
      case 'followup-review':
        if (!currentCase) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} />;
        return <FollowupReview userEmail={userEmail} onSend={handleSendEmail} onBack={() => setCurrentScreen('reply-received')} />;
      case 'settings':
        return <Settings userEmail={userEmail} onLogout={handleLogout} />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isLoggedIn && (
        <Sidebar 
          currentScreen={currentScreen} 
          currentCase={getCurrentCase()}
          onNavigate={setCurrentScreen}
          onResumeCase={handleResumeCase}
        />
      )}
      <div className="flex-1">
        {renderScreen()}
      </div>
    </div>
  );
}
