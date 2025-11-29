import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { HIPAAConsent } from './components/HIPAAConsent';
import { MyCases } from './components/MyCases';
import { CaseDetail } from './components/CaseDetail';
import { DenialUpload } from './components/DenialUpload';
import { AppealStrategy } from './components/AppealStrategy';
import { EmailReview } from './components/EmailReview';
import { EmailSent } from './components/EmailSent';
import { ReplyReceived } from './components/ReplyReceived';
import { FollowupReview } from './components/FollowupReview';
import { Settings } from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { InsurancePlans, type InsurancePlan } from './components/InsurancePlans';
import { InsurancePlanPolicyUpload } from './components/InsurancePlanPolicyUpload';
import { InsurancePlanExtractedInfo, type InsurancePlanParsedData } from './components/InsurancePlanExtractedInfo';
import { AddInsurancePlanCoverage } from './components/AddInsurancePlanCoverage';
import { AddInsurancePlanReview } from './components/AddInsurancePlanReview';
import { SelectPlanForAppeal } from './components/SelectPlanForAppeal';
import { DenialExtractedInfo, type DenialParsedData } from './components/DenialExtractedInfo';
import { EmailThread } from './components/EmailThread';
import { EditInsurancePlan } from './components/EditInsurancePlan';
import { apiUrl } from './config';
import { uploadFileToSupabase } from './utils/supabase/storage';
import { isSupabaseConfigured } from './utils/supabase/client';

export type Screen =
  | 'login'
  | 'hipaa-consent'
  | 'dashboard'
  | 'my-cases'
  | 'insurance-plans'
  | 'edit-insurance-plan'
  | 'add-insurance-plan-upload'
  | 'add-insurance-plan-extracted'
  | 'add-insurance-plan-coverage'
  | 'add-insurance-plan-review'
  | 'select-plan-for-appeal'
  | 'denial-upload'
  | 'denial-extracted-info'
  | 'case-detail'
  | 'email-thread'
  | 'strategy'
  | 'email-review'
  | 'email-sent'
  | 'reply-received'
  | 'followup-review'
  | 'settings';

export type CaseStatus = 'uploading' | 'analyzing' | 'ready-to-send' | 'sent' | 'awaiting-reply' | 'reply-received';

export type CaseStep = 'denial-upload' | 'denial-extracted-info' | 'strategy' | 'email-review' | 'email-sent' | 'reply-received' | 'followup-review';

export type Case = {
  id: string;
  planId: string;
  coveredPersonId: string;
  denialReasonTitle: string;
  dateCreated: string;
  status: CaseStatus;
  currentStep: CaseStep;
  hasNewEmail: boolean;
  denialFiles: (File | { name: string; size: number; type: string; bucket?: string; path?: string })[];
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
  const [hasAcceptedHIPAA, setHasAcceptedHIPAA] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userEmail, setUserEmail] = useState('');
  const [cases, setCases] = useState<Case[]>([]);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  // Draft state for insurance plan creation
  const [planDraft, setPlanDraft] = useState<{
    policyType?: 'comprehensive' | 'supplementary';
    policyFiles?: File[];
    planData?: InsurancePlanParsedData;
    coveredIndividuals?: any[];
    fromAppealFlow?: boolean;
  } | null>(null);

  const getCurrentCase = () => cases.find(c => c.id === currentCaseId);

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    const storedScreen = localStorage.getItem('currentScreen');
    const storedCaseId = localStorage.getItem('currentCaseId');

    if (storedUser && storedIsLoggedIn === 'true') {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setUserEmail(userData.email);
      setIsLoggedIn(true);

      if (userData.hipaaAccepted) {
        setHasAcceptedHIPAA(true);
        if (storedScreen) {
          setCurrentScreen(storedScreen as Screen);
        } else {
          setCurrentScreen('dashboard');
        }

        if (storedCaseId) {
          setCurrentCaseId(storedCaseId);
        }
      }

      // Fetch data
      if (userData._id) {
        Promise.all([
          fetch(apiUrl(`/api/plans?userId=${userData._id}`)),
          fetch(apiUrl(`/api/cases?userId=${userData._id}`))
        ]).then(async ([plansRes, casesRes]) => {
          if (plansRes.ok) {
            const plans = await plansRes.json();
            setInsurancePlans(plans);
          }
          if (casesRes.ok) {
            const userCases = await casesRes.json();
            setCases(userCases);
          }
        }).catch(e => console.error("Error restoring data", e));
      }
    }
  }, []);

  // Persist navigation state
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('currentScreen', currentScreen);
      if (currentCaseId) {
        localStorage.setItem('currentCaseId', currentCaseId);
      } else {
        localStorage.removeItem('currentCaseId');
      }
    }
  }, [currentScreen, currentCaseId, isLoggedIn]);

  // Helper to update case in both state and database
  const updateCaseInDb = async (caseId: string, updates: Partial<Case>) => {
    try {
      const response = await fetch(apiUrl(`/api/cases/${caseId}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedCase = await response.json();
        setCases(prevCases => prevCases.map(c =>
          c.id === caseId ? updatedCase : c
        ));
        return updatedCase;
      } else {
        console.error('Failed to update case');
      }
    } catch (e) {
      console.error('Error updating case:', e);
    }
  };

  const handleLogin = async (userData: any) => {
    setUser(userData);
    setUserEmail(userData.email);
    setIsLoggedIn(true);

    // Persist login to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');

    if (userData._id) {
      try {
        const [plansRes, casesRes] = await Promise.all([
          fetch(apiUrl(`/api/plans?userId=${userData._id}`)),
          fetch(apiUrl(`/api/cases?userId=${userData._id}`))
        ]);

        if (plansRes.ok) {
          const plans = await plansRes.json();
          setInsurancePlans(plans);
        }
        if (casesRes.ok) {
          const userCases = await casesRes.json();
          setCases(userCases);
        }
      } catch (e) {
        console.error("Error fetching user data", e);
      }
    }

    if (userData.hipaaAccepted) {
      setHasAcceptedHIPAA(true);
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('hipaa-consent');
    }
  };

  const handleHIPAAAccept = async () => {
    if (!user?._id) {
      // Fallback if user ID is missing (shouldn't happen with real login)
      setHasAcceptedHIPAA(true);
      setCurrentScreen('dashboard');
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/users/${user._id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hipaaAccepted: true, termsAccepted: true }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setHasAcceptedHIPAA(true);
        setCurrentScreen('dashboard');
      } else {
        console.error("Failed to update HIPAA status");
        // Allow proceeding anyway for UX, but log error
        setHasAcceptedHIPAA(true);
        setCurrentScreen('dashboard');
      }
    } catch (e) {
      console.error("Error updating HIPAA status:", e);
      setHasAcceptedHIPAA(true);
      setCurrentScreen('dashboard');
    }
  };

  const handleStartNewAppeal = () => {
    setCurrentScreen('select-plan-for-appeal');
  };

  const handleStartNewAppealWithPlan = async (planId: string, coveredPersonId: string) => {
    const plan = insurancePlans.find(p => p.id === planId);
    if (!plan) return;

    const newCaseData = {
      id: Date.now().toString(),
      userId: user?._id || "691e93c4fd7adcd73e6f628c",
      planId,
      coveredPersonId,
      denialReasonTitle: 'Pending Analysis',
      dateCreated: new Date().toISOString(),
      status: 'uploading',
      currentStep: 'denial-upload',
      hasNewEmail: false,
      denialFiles: [],
      parsedData: null,
      emailThread: []
    };

    try {
      const response = await fetch(apiUrl("/api/cases"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCaseData),
      });

      if (response.ok) {
        const savedCase = await response.json();
        setCases([...cases, savedCase]);
        setCurrentCaseId(savedCase.id);
        setCurrentScreen('denial-upload');
      } else {
        console.error("Failed to create case");
      }
    } catch (e) {
      console.error("Error creating case:", e);
    }
  };

  const handleAddInsurancePlan = (fromAppealFlow = false) => {
    setPlanDraft({ fromAppealFlow });
    setCurrentScreen('add-insurance-plan-upload');
  };

  const handlePlanPolicyUploadComplete = (policyType: 'comprehensive' | 'supplementary', files: File[]) => {
    setPlanDraft(prev => ({ ...prev!, policyType, policyFiles: files }));

    // Simulate document analysis
    setTimeout(() => {
      const extractedData: InsurancePlanParsedData = {
        insuranceCompany: 'Blue Cross Blue Shield',
        planName: 'PPO Gold 2024',
        policyNumber: 'ABC123456',
        groupNumber: 'GRP789',
      };
      setPlanDraft(prev => ({ ...prev!, planData: extractedData }));
      setCurrentScreen('add-insurance-plan-extracted');
    }, 2000);
  };

  const handlePlanExtractedInfoSave = (data: InsurancePlanParsedData) => {
    setPlanDraft(prev => ({ ...prev!, planData: data }));
    setCurrentScreen('add-insurance-plan-coverage');
  };

  const handlePlanCoverageComplete = (coveredIndividuals: any[]) => {
    setPlanDraft(prev => ({ ...prev!, coveredIndividuals }));
    setCurrentScreen('add-insurance-plan-review');
  };

  const handlePlanReviewConfirm = async () => {
    if (!planDraft?.policyType || !planDraft?.policyFiles || !planDraft?.planData || !planDraft?.coveredIndividuals) return;

    try {
      let response;

      if (isSupabaseConfigured) {
        // Upload to Supabase Storage (supports 100MB+ files)
        const uploadedFiles = await Promise.all(planDraft.policyFiles.map(async (file) => {
          const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const path = `plans/${user?._id || 'anon'}/${Date.now()}-${cleanName}`;

          await uploadFileToSupabase(file, 'policies', path);

          return {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            bucket: 'policies',
            path
          };
        }));

        const payload = {
          id: Date.now().toString(),
          userId: user?._id || "691e93c4fd7adcd73e6f628c",
          insuranceCompany: planDraft.planData.insuranceCompany || "",
          planName: planDraft.planData.planName || "",
          policyNumber: planDraft.planData.policyNumber || "",
          groupNumber: planDraft.planData.groupNumber || "",
          policyType: planDraft.policyType,
          dateAdded: new Date().toISOString(),
          coveredIndividuals: planDraft.coveredIndividuals || [],
          policyFiles: uploadedFiles
        };

        response = await fetch(apiUrl("/api/plans"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Fallback: Direct upload (limited to 4.5MB on Vercel)
        const formData = new FormData();
        formData.append("id", Date.now().toString());
        formData.append("userId", user?._id || "691e93c4fd7adcd73e6f628c");
        formData.append("insuranceCompany", planDraft.planData.insuranceCompany || "");
        formData.append("planName", planDraft.planData.planName || "");
        formData.append("policyNumber", planDraft.planData.policyNumber || "");
        formData.append("groupNumber", planDraft.planData.groupNumber || "");
        formData.append("policyType", planDraft.policyType);
        formData.append("dateAdded", new Date().toISOString());
        formData.append("coveredIndividuals", JSON.stringify(planDraft.coveredIndividuals || []));

        planDraft.policyFiles.forEach((file) => {
          formData.append("policyFiles[]", file);
        });

        response = await fetch(apiUrl("/api/plans"), {
          method: "POST",
          body: formData,
        });
      }

      if (response.ok) {
        const savedPlan = await response.json();
        // Reconstruct file objects for frontend state if needed, or just use what we have
        // The backend returns binary data which might be heavy to keep in memory for the list view
        // For now, we'll just use the returned plan but maybe keep the local file references if needed for UI
        // Actually, the frontend 'InsurancePlan' type expects 'policyFiles: File[]'.
        // The backend returns 'policyFiles: { name, size, ... }'.
        // We might need to adjust the frontend type or map the response.
        // For simplicity, let's assume we just refresh the list or add the local version.

        // Let's just add the local version to state to avoid type errors for now, 
        // but in a real app we should fetch the fresh list.
        const newPlan: InsurancePlan = {
          ...savedPlan,
          policyFiles: planDraft.policyFiles // Keep local file references for UI
        };

        setInsurancePlans([...insurancePlans, newPlan]);

        // If from appeal flow, continue to select plan for appeal
        if (planDraft.fromAppealFlow) {
          setPlanDraft(null);
          setCurrentScreen('select-plan-for-appeal');
        } else {
          // Otherwise, go back to insurance plans list
          setPlanDraft(null);
          setCurrentScreen('insurance-plans');
        }
      } else {
        console.error("Failed to create plan");
      }
    } catch (e) {
      console.error("Error creating plan:", e);
    }
  };

  const handleEditPlan = (planId: string) => {
    setCurrentPlanId(planId);
    setCurrentScreen('edit-insurance-plan');
  };

  const handleSaveEditedPlan = async (updatedPlan: InsurancePlan) => {
    try {
      let finalPolicyFiles = updatedPlan.policyFiles;

      // If Supabase is configured, upload new files
      if (isSupabaseConfigured) {
        const uploadedFiles = [];
        for (const file of updatedPlan.policyFiles) {
          if (file instanceof File) {
            // New file, upload it
            const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const userId = (updatedPlan as any).userId || 'anon';
            const path = `policies/${userId}/${Date.now()}-${cleanName}`;

            await uploadFileToSupabase(file, 'policies', path);
            uploadedFiles.push({
              name: file.name,
              size: file.size,
              type: file.type,
              bucket: 'policies',
              path: path,
              lastModified: file.lastModified
            });
          } else {
            // Existing file metadata
            uploadedFiles.push(file);
          }
        }
        finalPolicyFiles = uploadedFiles as any;
      }

      // Prepare updates for backend
      const updates = {
        ...updatedPlan,
        policyFiles: finalPolicyFiles
      };

      const response = await fetch(apiUrl(`/api/plans/${updatedPlan.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const savedPlan = await response.json();

        // Update local state with the saved plan and the file list we just constructed
        // (which includes metadata for new files)
        setInsurancePlans(insurancePlans.map(p =>
          p.id === updatedPlan.id ? { ...savedPlan, policyFiles: finalPolicyFiles } : p
        ));
        setCurrentPlanId(null);
        setCurrentScreen('insurance-plans');
      } else {
        console.error("Failed to update plan");
        alert("Failed to save changes. Please try again.");
      }
    } catch (e) {
      console.error("Error updating plan:", e);
      alert("Error updating plan. Please check your connection.");
    }
  };

  const handleDenialUploadComplete = async (files: (File | { name: string; size: number; type: string; bucket?: string; path?: string })[]) => {
    if (!currentCaseId) return;

    try {
      const newFiles = files.filter(f => f instanceof File) as File[];
      const existingFiles = files.filter(f => !(f instanceof File)) as { name: string; size: number; type: string; bucket?: string; path?: string }[];

      let updatedCase;

      if (isSupabaseConfigured) {
        // Upload new files to Supabase
        const uploadedNewFiles = await Promise.all(newFiles.map(async (file) => {
          const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const path = `cases/${currentCaseId}/${Date.now()}-${cleanName}`;

          await uploadFileToSupabase(file, 'denials', path);

          return {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            bucket: 'denials',
            path
          };
        }));

        const allFiles = [...existingFiles, ...uploadedNewFiles];

        // Use updateCaseInDb (PATCH) to sync the full list
        updatedCase = await updateCaseInDb(currentCaseId, {
          denialFiles: allFiles,
          status: 'analyzing'
        });

      } else {
        // Fallback: Direct upload (limited to 4.5MB on Vercel)
        if (newFiles.length > 0) {
          const formData = new FormData();
          newFiles.forEach(file => {
            formData.append("denialFiles[]", file);
          });

          const response = await fetch(apiUrl(`/api/cases/${currentCaseId}/files`), {
            method: "POST",
            body: formData
          });

          if (response.ok) {
            updatedCase = await response.json();
          }
        } else {
          const response = await fetch(apiUrl(`/api/cases/${currentCaseId}`));
          if (response.ok) updatedCase = await response.json();
        }
      }

      if (updatedCase) {
        setCases(cases.map(c =>
          c.id === currentCaseId ? updatedCase : c
        ));

        // Simulate denial document analysis
        setTimeout(() => {
          const extractedDenialData: DenialParsedData = {
            briefDescription: 'ER visit for chest pain denied as not medically necessary'
          };

          setCurrentScreen('denial-extracted-info');
        }, 2000);
      } else {
        console.error("Failed to upload/update files");
      }
    } catch (e) {
      console.error("Error uploading files:", e);
    }
  };

  const handleDenialExtractedInfoSave = async (data: DenialParsedData) => {
    if (!currentCaseId) return;
    const currentCase = getCurrentCase();
    if (!currentCase) return;

    const plan = insurancePlans.find(p => p.id === currentCase.planId);

    const parsedData: ParsedData = {
      insurer: plan?.insuranceCompany || 'Unknown Insurer',
      policyNumber: plan?.policyNumber || 'Unknown',
      denialReason: data.briefDescription
    };

    await updateCaseInDb(currentCaseId, {
      parsedData,
      denialReasonTitle: data.briefDescription,
      currentStep: 'strategy',
      status: 'ready-to-send'
    });

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

  const handleSendEmail = async (message: EmailMessage) => {
    if (!currentCaseId) return;
    const currentCase = getCurrentCase();
    if (!currentCase) return;

    await updateCaseInDb(currentCaseId, {
      emailThread: [...currentCase.emailThread, message],
      status: 'awaiting-reply',
      currentStep: 'email-sent'
    });

    setCurrentScreen('email-sent');
  };

  const handleViewReply = () => {
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

  const handleSubmitResponse = async (response: EmailMessage) => {
    if (!currentCaseId) return;
    const currentCase = getCurrentCase();
    if (!currentCase) return;

    await updateCaseInDb(currentCaseId, {
      emailThread: [...currentCase.emailThread, response],
      status: 'reply-received',
      currentStep: 'reply-received',
      hasNewEmail: true
    });

    setCurrentScreen('reply-received');
  };

  const handleViewEmailThread = () => {
    setCurrentScreen('email-thread');
  };

  const handleResumeCase = (caseId: string) => {
    const caseToResume = cases.find(c => c.id === caseId);
    if (!caseToResume) return;

    setCurrentCaseId(caseId);
    setCurrentScreen(caseToResume.currentStep);
  };

  const handleDeleteCase = async (caseId: string) => {
    try {
      const response = await fetch(apiUrl(`/api/cases/${caseId}`), {
        method: "DELETE",
      });

      if (response.ok) {
        setCases(cases.filter(c => c.id !== caseId));
        if (currentCaseId === caseId) {
          setCurrentCaseId(null);
          setCurrentScreen('my-cases');
        }
      } else {
        console.error("Failed to delete case");
      }
    } catch (e) {
      console.error("Error deleting case:", e);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const response = await fetch(apiUrl(`/api/plans/${planId}`), {
        method: "DELETE",
      });

      if (response.ok) {
        setInsurancePlans(insurancePlans.filter(p => p.id !== planId));
      } else {
        console.error("Failed to delete plan");
      }
    } catch (e) {
      console.error("Error deleting plan:", e);
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
    setHasAcceptedHIPAA(false);
    setIsLoggedIn(false);
    setHasAcceptedHIPAA(false);
    setUser(null);
    setUserEmail('');
    setCases([]);
    setCurrentCaseId(null);
    setInsurancePlans([]);
    setCurrentPlanId(null);
    setPlanDraft(null);
    setCurrentScreen('login');
  };

  const handleViewCase = (caseId: string) => {
    setCurrentCaseId(caseId);
    setCurrentScreen('case-detail');
  };

  const renderScreen = () => {
    const currentCase = getCurrentCase();

    switch (currentScreen) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'hipaa-consent':
        return <HIPAAConsent onAccept={handleHIPAAAccept} />;
      case 'dashboard':
        return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} />;
      case 'my-cases':
        return <MyCases cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} onStartNew={handleStartNewAppeal} onDeleteCase={handleDeleteCase} onResolveCase={handleResolveCase} />;

      // Insurance Plans Management
      case 'insurance-plans':
        return <InsurancePlans
          plans={insurancePlans}
          onAddPlan={() => handleAddInsurancePlan(false)}
          onEditPlan={handleEditPlan}
          onDeletePlan={handleDeletePlan}
        />;

      case 'edit-insurance-plan':
        const planToEdit = insurancePlans.find(p => p.id === currentPlanId);
        if (!planToEdit) {
          setCurrentScreen('insurance-plans');
          return null;
        }
        return <EditInsurancePlan
          plan={planToEdit}
          onSave={handleSaveEditedPlan}
          onBack={() => setCurrentScreen('insurance-plans')}
        />;
      case 'add-insurance-plan-upload':
        return <InsurancePlanPolicyUpload
          onComplete={handlePlanPolicyUploadComplete}
          onBack={() => {
            setPlanDraft(null);
            setCurrentScreen(insurancePlans.length > 0 ? 'insurance-plans' : 'dashboard');
          }}
        />;
      case 'add-insurance-plan-extracted':
        return <InsurancePlanExtractedInfo
          data={planDraft?.planData || { insuranceCompany: '', planName: '', policyNumber: '', groupNumber: '' }}
          onSave={handlePlanExtractedInfoSave}
          onBack={() => setCurrentScreen('add-insurance-plan-upload')}
        />;
      case 'add-insurance-plan-coverage':
        return <AddInsurancePlanCoverage
          userEmail={userEmail}
          initialCoveredIndividuals={planDraft?.coveredIndividuals}
          onContinue={handlePlanCoverageComplete}
          onBack={() => setCurrentScreen('add-insurance-plan-extracted')}
        />;
      case 'add-insurance-plan-review':
        return <AddInsurancePlanReview
          planData={planDraft?.planData || { insuranceCompany: '', planName: '', policyNumber: '', groupNumber: '' }}
          policyType={planDraft?.policyType || 'comprehensive'}
          policyFiles={planDraft?.policyFiles || []}
          coveredIndividuals={planDraft?.coveredIndividuals || []}
          fromAppealFlow={planDraft?.fromAppealFlow}
          onConfirm={handlePlanReviewConfirm}
          onBack={() => setCurrentScreen('add-insurance-plan-coverage')}
        />;

      // Start New Appeal Flow
      case 'select-plan-for-appeal':
        return <SelectPlanForAppeal
          plans={insurancePlans}
          onContinue={handleStartNewAppealWithPlan}
          onCancel={() => setCurrentScreen('dashboard')}
          onAddPlan={() => handleAddInsurancePlan(true)}
        />;

      // Case Details and Management
      case 'case-detail':
        if (!currentCase) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} />;
        const casePlan = insurancePlans.find(p => p.id === currentCase.planId);
        return <CaseDetail
          case={currentCase}
          plan={casePlan}
          onBack={() => setCurrentScreen('my-cases')}
          onDeleteCase={handleDeleteCase}
          onResolveCase={handleResolveCase}
          onViewEmailThread={handleViewEmailThread}
          userEmail={userEmail}
          onSubmitResponse={handleSubmitResponse}
          onDraftFollowup={() => setCurrentScreen('followup-review')}
        />;

      case 'email-thread':
        if (!currentCase) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} />;
        return <EmailThread
          emailThread={currentCase.emailThread}
          userEmail={userEmail}
          onBack={() => setCurrentScreen('case-detail')}
        />;

      // Appeal Creation Flow
      case 'denial-upload':
        if (!currentCase) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} />;
        return <DenialUpload
          initialFiles={currentCase.denialFiles}
          onContinue={handleDenialUploadComplete}
          onBack={() => setCurrentScreen('select-plan-for-appeal')}
          onDelete={() => handleDeleteCase(currentCase.id)}
        />;
      case 'denial-extracted-info':
        if (!currentCase) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} />;
        const plan = insurancePlans.find(p => p.id === currentCase.planId);
        return <DenialExtractedInfo
          data={{ briefDescription: currentCase.denialReasonTitle }}
          insuranceCompany={plan?.insuranceCompany || 'Unknown'}
          policyNumber={plan?.policyNumber || 'Unknown'}
          onSave={handleDenialExtractedInfoSave}
          onBack={() => setCurrentScreen('denial-upload')}
        />;
      case 'strategy':
        if (!currentCase?.parsedData) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} />;
        return <AppealStrategy parsedData={currentCase.parsedData} onDraftEmail={handleDraftEmail} onBack={() => setCurrentScreen('denial-extracted-info')} />;
      case 'email-review':
        if (!currentCase?.parsedData) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} />;
        return <EmailReview userEmail={userEmail} parsedData={currentCase.parsedData} onSend={handleSendEmail} onBack={() => setCurrentScreen('strategy')} />;
      case 'email-sent':
        if (!currentCase) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} />;
        return <EmailSent case={currentCase} userEmail={userEmail} onViewReply={handleViewReply} onBackToDashboard={() => setCurrentScreen('dashboard')} onSubmitResponse={handleSubmitResponse} />;
      case 'reply-received':
        if (!currentCase) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} />;
        return <ReplyReceived case={currentCase} onDraftFollowup={() => setCurrentScreen('followup-review')} onBack={() => setCurrentScreen('email-sent')} />;
      case 'followup-review':
        if (!currentCase) return <Dashboard onStartNewAppeal={handleStartNewAppeal} cases={cases} onViewCase={handleViewCase} onResumeCase={handleResumeCase} />;
        return <FollowupReview userEmail={userEmail} onSend={handleSendEmail} onBack={() => setCurrentScreen('reply-received')} />;
      case 'settings':
        return <Settings userEmail={userEmail} onLogout={handleLogout} />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  // When not logged in or hasn't accepted HIPAA, render screen directly without sidebar
  if (!isLoggedIn || !hasAcceptedHIPAA) {
    return renderScreen();
  }

  // When logged in and HIPAA accepted, render with sidebar and flex layout
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
      />
      <div className="flex-1">
        {renderScreen()}
      </div>
    </div>
  );
}
