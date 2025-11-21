import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Login } from "./components/Login";
import { HIPAAConsent } from "./components/HIPAAConsent";
import { MyCases } from "./components/MyCases";
import { CaseDetail } from "./components/CaseDetail";
import { DenialUpload } from "./components/DenialUpload";
import { AppealStrategy } from "./components/AppealStrategy";
import { EmailReview } from "./components/EmailReview";
import { EmailSent } from "./components/EmailSent";
import { ReplyReceived } from "./components/ReplyReceived";
import { FollowupReview } from "./components/FollowupReview";
import { Settings } from "./components/Settings";
import { Sidebar } from "./components/Sidebar";
import {
  InsurancePlans,
  type InsurancePlan,
} from "./components/InsurancePlans";
import { InsurancePlanPolicyUpload } from "./components/InsurancePlanPolicyUpload";
import {
  InsurancePlanExtractedInfo,
  type InsurancePlanParsedData,
} from "./components/InsurancePlanExtractedInfo";
import { AddInsurancePlanCoverage } from "./components/AddInsurancePlanCoverage";
import { AddInsurancePlanReview } from "./components/AddInsurancePlanReview";
import { SelectPlanForAppeal } from "./components/SelectPlanForAppeal";
import {
  DenialExtractedInfo,
  type DenialParsedData,
} from "./components/DenialExtractedInfo";
import { EmailThread } from "./components/EmailThread";
import { EditInsurancePlan } from "./components/EditInsurancePlan";

export type Screen =
  | "login"
  | "hipaa-consent"
  | "dashboard"
  | "my-cases"
  | "insurance-plans"
  | "edit-insurance-plan"
  | "add-insurance-plan-upload"
  | "add-insurance-plan-extracted"
  | "add-insurance-plan-coverage"
  | "add-insurance-plan-review"
  | "select-plan-for-appeal"
  | "denial-upload"
  | "denial-extracted-info"
  | "case-detail"
  | "email-thread"
  | "strategy"
  | "email-review"
  | "email-sent"
  | "reply-received"
  | "followup-review"
  | "settings";

export type CaseStatus =
  | "uploading"
  | "analyzing"
  | "ready-to-send"
  | "sent"
  | "awaiting-reply"
  | "reply-received";

export type CaseStep =
  | "denial-upload"
  | "denial-extracted-info"
  | "strategy"
  | "email-review"
  | "email-sent"
  | "reply-received"
  | "followup-review";

export type Case = {
  id: string;
  planId: string;
  coveredPersonId: string;
  denialReasonTitle: string;
  dateCreated: string;
  status: CaseStatus;
  currentStep: CaseStep;
  hasNewEmail: boolean;
  denialFiles: File[];
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
  type: "sent" | "received";
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasAcceptedHIPAA, setHasAcceptedHIPAA] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  // Draft state for insurance plan creation
  const [planDraft, setPlanDraft] = useState<{
    policyType?: "comprehensive" | "supplementary";
    policyFiles?: File[];
    planData?: InsurancePlanParsedData;
    coveredIndividuals?: any[];
    fromAppealFlow?: boolean;
  } | null>(null);

  const getCurrentCase = () => cases.find((c) => c.id === currentCaseId);

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    setCurrentScreen("hipaa-consent");
  };

  const handleHIPAAAccept = () => {
    setHasAcceptedHIPAA(true);
    setCurrentScreen("dashboard");
  };

  const handleStartNewAppeal = () => {
    setCurrentScreen("select-plan-for-appeal");
  };

  const handleStartNewAppealWithPlan = (
    planId: string,
    coveredPersonId: string
  ) => {
    const plan = insurancePlans.find((p) => p.id === planId);
    if (!plan) return;

    const newCase: Case = {
      id: Date.now().toString(),
      planId,
      coveredPersonId,
      denialReasonTitle: "Pending Analysis",
      dateCreated: new Date().toISOString(),
      status: "uploading",
      currentStep: "denial-upload",
      hasNewEmail: false,
      denialFiles: [],
      parsedData: null,
      emailThread: [],
    };

    setCases([...cases, newCase]);
    setCurrentCaseId(newCase.id);
    setCurrentScreen("denial-upload");
  };

  const handleAddInsurancePlan = (fromAppealFlow = false) => {
    setPlanDraft({ fromAppealFlow });
    setCurrentScreen("add-insurance-plan-upload");
  };

  const handlePlanPolicyUploadComplete = (
    policyType: "comprehensive" | "supplementary",
    files: File[]
  ) => {
    setPlanDraft({ ...planDraft, policyType, policyFiles: files });

    // Simulate document analysis
    setTimeout(() => {
      const extractedData: InsurancePlanParsedData = {
        insuranceCompany: "Blue Cross Blue Shield",
        planName: "PPO Gold 2024",
        policyNumber: "ABC123456",
        groupNumber: "GRP789",
      };
      setPlanDraft((prev) => ({ ...prev, planData: extractedData }));
      setCurrentScreen("add-insurance-plan-extracted");
    }, 2000);
  };

  const handlePlanExtractedInfoSave = (data: InsurancePlanParsedData) => {
    setPlanDraft({ ...planDraft, planData: data });
    setCurrentScreen("add-insurance-plan-coverage");
  };

  const handlePlanCoverageComplete = (coveredIndividuals: any[]) => {
    setPlanDraft({ ...planDraft, coveredIndividuals });
    setCurrentScreen("add-insurance-plan-review");
  };

  const handlePlanReviewConfirm = () => {
    if (
      !planDraft?.policyType ||
      !planDraft?.policyFiles ||
      !planDraft?.planData ||
      !planDraft?.coveredIndividuals
    )
      return;

    const newPlan: InsurancePlan = {
      id: Date.now().toString(),
      insuranceCompany: planDraft.planData.insuranceCompany,
      planName: planDraft.planData.planName,
      policyNumber: planDraft.planData.policyNumber,
      groupNumber: planDraft.planData.groupNumber,
      policyType: planDraft.policyType,
      policyFiles: planDraft.policyFiles,
      coveredIndividuals: planDraft.coveredIndividuals,
      dateAdded: new Date().toISOString(),
    };

    setInsurancePlans([...insurancePlans, newPlan]);

    // If from appeal flow, continue to select plan for appeal
    if (planDraft.fromAppealFlow) {
      setPlanDraft(null);
      setCurrentScreen("select-plan-for-appeal");
    } else {
      // Otherwise, go back to insurance plans list
      setPlanDraft(null);
      setCurrentScreen("insurance-plans");
    }
  };

  const handleEditPlan = (planId: string) => {
    setCurrentPlanId(planId);
    setCurrentScreen("edit-insurance-plan");
  };

  const handleSaveEditedPlan = (updatedPlan: InsurancePlan) => {
    setInsurancePlans(
      insurancePlans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
    );
    setCurrentPlanId(null);
    setCurrentScreen("insurance-plans");
  };

  const handleDenialUploadComplete = (files: File[]) => {
    if (!currentCaseId) return;
    const currentCase = getCurrentCase();
    if (!currentCase) return;

    setCases(
      cases.map((c) =>
        c.id === currentCaseId
          ? { ...c, denialFiles: files, status: "analyzing" }
          : c
      )
    );

    // Simulate denial document analysis
    setTimeout(() => {
      const extractedDenialData: DenialParsedData = {
        briefDescription:
          "ER visit for chest pain denied as not medically necessary",
      };

      setCurrentScreen("denial-extracted-info");
    }, 2000);
  };

  const handleDenialExtractedInfoSave = (data: DenialParsedData) => {
    if (!currentCaseId) return;
    const currentCase = getCurrentCase();
    if (!currentCase) return;

    const plan = insurancePlans.find((p) => p.id === currentCase.planId);

    const parsedData: ParsedData = {
      insurer: plan?.insuranceCompany || "Unknown Insurer",
      policyNumber: plan?.policyNumber || "Unknown",
      denialReason: data.briefDescription,
    };

    setCases((prevCases) =>
      prevCases.map((c) =>
        c.id === currentCaseId
          ? {
              ...c,
              parsedData,
              denialReasonTitle: data.briefDescription,
              currentStep: "strategy",
              status: "ready-to-send",
            }
          : c
      )
    );

    setCurrentScreen("strategy");
  };

  const handleDraftEmail = (draft: { subject: string; body: string }) => {
    if (!currentCaseId) return;
    setCases(
      cases.map((c) =>
        c.id === currentCaseId ? { ...c, currentStep: "email-review" } : c
      )
    );
    setCurrentScreen("email-review");
  };

  const handleSendEmail = (message: EmailMessage) => {
    if (!currentCaseId) return;
    setCases(
      cases.map((c) =>
        c.id === currentCaseId
          ? {
              ...c,
              emailThread: [...c.emailThread, message],
              status: "awaiting-reply",
              currentStep: "email-sent",
            }
          : c
      )
    );
    setCurrentScreen("email-sent");
  };

  const handleViewReply = () => {
    if (!currentCaseId) return;
    const reply: EmailMessage = {
      id: Date.now().toString(),
      from: "claims@healthguard.com",
      to: userEmail,
      subject: "Re: Appeal for Claim Denial",
      body: "Insurance company response...",
      date: new Date().toISOString(),
      type: "received",
    };
    setCases(
      cases.map((c) =>
        c.id === currentCaseId
          ? {
              ...c,
              emailThread: [...c.emailThread, reply],
              status: "reply-received",
              currentStep: "reply-received",
              hasNewEmail: true,
            }
          : c
      )
    );
    setCurrentScreen("reply-received");
  };

  const handleViewCase = (caseId: string) => {
    setCurrentCaseId(caseId);
    setCurrentScreen("case-detail");
  };

  const handleViewEmailThread = () => {
    setCurrentScreen("email-thread");
  };

  const handleResumeCase = (caseId: string) => {
    const caseToResume = cases.find((c) => c.id === caseId);
    if (!caseToResume) return;

    setCurrentCaseId(caseId);
    setCurrentScreen(caseToResume.currentStep);
  };

  const handleDeleteCase = (caseId: string) => {
    setCases(cases.filter((c) => c.id !== caseId));
    if (currentCaseId === caseId) {
      setCurrentCaseId(null);
      setCurrentScreen("my-cases");
    }
  };

  const handleResolveCase = (caseId: string, feedback?: string) => {
    setCases(
      cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              resolved: true,
              resolvedDate: new Date().toISOString(),
              feedback,
            }
          : c
      )
    );
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setHasAcceptedHIPAA(false);
    setUserEmail("");
    setCases([]);
    setCurrentCaseId(null);
    setInsurancePlans([]);
    setCurrentPlanId(null);
    setPlanDraft(null);
    setCurrentScreen("login");
  };

  const renderScreen = () => {
    const currentCase = getCurrentCase();

    switch (currentScreen) {
      case "login":
        return <Login onLogin={handleLogin} />;
      case "hipaa-consent":
        return <HIPAAConsent onAccept={handleHIPAAAccept} />;
      case "dashboard":
        return (
          <Dashboard
            onStartNewAppeal={handleStartNewAppeal}
            cases={cases}
            insurancePlans={insurancePlans}
            onViewCase={handleViewCase}
            onResumeCase={handleResumeCase}
          />
        );
      case "my-cases":
        return (
          <MyCases
            cases={cases}
            insurancePlans={insurancePlans}
            onViewCase={handleViewCase}
            onResumeCase={handleResumeCase}
            onStartNew={handleStartNewAppeal}
            onDeleteCase={handleDeleteCase}
            onResolveCase={handleResolveCase}
          />
        );

      // Insurance Plans Management
      case "insurance-plans":
        return (
          <InsurancePlans
            plans={insurancePlans}
            onAddPlan={() => handleAddInsurancePlan(false)}
            onEditPlan={handleEditPlan}
          />
        );

      case "edit-insurance-plan":
        const planToEdit = insurancePlans.find((p) => p.id === currentPlanId);
        if (!planToEdit) {
          setCurrentScreen("insurance-plans");
          return null;
        }
        return (
          <EditInsurancePlan
            plan={planToEdit}
            onSave={handleSaveEditedPlan}
            onBack={() => setCurrentScreen("insurance-plans")}
          />
        );
      case "add-insurance-plan-upload":
        return (
          <InsurancePlanPolicyUpload
            onComplete={handlePlanPolicyUploadComplete}
            onBack={() => {
              setPlanDraft(null);
              setCurrentScreen(
                insurancePlans.length > 0 ? "insurance-plans" : "dashboard"
              );
            }}
          />
        );
      case "add-insurance-plan-extracted":
        return (
          <InsurancePlanExtractedInfo
            data={
              planDraft?.planData || {
                insuranceCompany: "",
                planName: "",
                policyNumber: "",
                groupNumber: "",
              }
            }
            onSave={handlePlanExtractedInfoSave}
            onBack={() => setCurrentScreen("add-insurance-plan-upload")}
          />
        );
      case "add-insurance-plan-coverage":
        return (
          <AddInsurancePlanCoverage
            userEmail={userEmail}
            initialCoveredIndividuals={planDraft?.coveredIndividuals}
            onContinue={handlePlanCoverageComplete}
            onBack={() => setCurrentScreen("add-insurance-plan-extracted")}
          />
        );
      case "add-insurance-plan-review":
        return (
          <AddInsurancePlanReview
            planData={
              planDraft?.planData || {
                insuranceCompany: "",
                planName: "",
                policyNumber: "",
                groupNumber: "",
              }
            }
            policyType={planDraft?.policyType || "comprehensive"}
            policyFiles={planDraft?.policyFiles || []}
            coveredIndividuals={planDraft?.coveredIndividuals || []}
            fromAppealFlow={planDraft?.fromAppealFlow}
            onConfirm={handlePlanReviewConfirm}
            onBack={() => setCurrentScreen("add-insurance-plan-coverage")}
          />
        );

      // Start New Appeal Flow
      case "select-plan-for-appeal":
        return (
          <SelectPlanForAppeal
            plans={insurancePlans}
            onContinue={handleStartNewAppealWithPlan}
            onCancel={() => setCurrentScreen("dashboard")}
            onAddPlan={() => handleAddInsurancePlan(true)}
          />
        );

      // Case Details and Management
      case "case-detail":
        if (!currentCase)
          return (
            <Dashboard
              onStartNewAppeal={handleStartNewAppeal}
              cases={cases}
              insurancePlans={insurancePlans}
              onViewCase={handleViewCase}
              onResumeCase={handleResumeCase}
            />
          );
        const casePlan = insurancePlans.find(
          (p) => p.id === currentCase.planId
        );
        return (
          <CaseDetail
            case={currentCase}
            plan={casePlan}
            onBack={() => setCurrentScreen("my-cases")}
            onDeleteCase={handleDeleteCase}
            onResolveCase={handleResolveCase}
            onViewEmailThread={handleViewEmailThread}
          />
        );

      case "email-thread":
        if (!currentCase)
          return (
            <Dashboard
              onStartNewAppeal={handleStartNewAppeal}
              cases={cases}
              insurancePlans={insurancePlans}
              onViewCase={handleViewCase}
              onResumeCase={handleResumeCase}
            />
          );
        return (
          <EmailThread
            emailThread={currentCase.emailThread}
            userEmail={userEmail}
            onBack={() => setCurrentScreen("case-detail")}
          />
        );

      // Appeal Creation Flow
      case "denial-upload":
        if (!currentCase)
          return (
            <Dashboard
              onStartNewAppeal={handleStartNewAppeal}
              cases={cases}
              insurancePlans={insurancePlans}
              onViewCase={handleViewCase}
              onResumeCase={handleResumeCase}
            />
          );
        return (
          <DenialUpload
            onContinue={handleDenialUploadComplete}
            onBack={() => setCurrentScreen("select-plan-for-appeal")}
          />
        );
      case "denial-extracted-info":
        if (!currentCase)
          return (
            <Dashboard
              onStartNewAppeal={handleStartNewAppeal}
              cases={cases}
              insurancePlans={insurancePlans}
              onViewCase={handleViewCase}
              onResumeCase={handleResumeCase}
            />
          );
        const plan = insurancePlans.find((p) => p.id === currentCase.planId);
        return (
          <DenialExtractedInfo
            data={{ briefDescription: currentCase.denialReasonTitle }}
            insuranceCompany={plan?.insuranceCompany || "Unknown"}
            policyNumber={plan?.policyNumber || "Unknown"}
            onSave={handleDenialExtractedInfoSave}
            onBack={() => setCurrentScreen("denial-upload")}
          />
        );
      case "strategy":
        if (!currentCase?.parsedData)
          return (
            <Dashboard
              onStartNewAppeal={handleStartNewAppeal}
              cases={cases}
              insurancePlans={insurancePlans}
              onViewCase={handleViewCase}
              onResumeCase={handleResumeCase}
            />
          );
        return (
          <AppealStrategy
            parsedData={currentCase.parsedData}
            onDraftEmail={handleDraftEmail}
            onBack={() => setCurrentScreen("denial-extracted-info")}
          />
        );
      case "email-review":
        if (!currentCase?.parsedData)
          return (
            <Dashboard
              onStartNewAppeal={handleStartNewAppeal}
              cases={cases}
              insurancePlans={insurancePlans}
              onViewCase={handleViewCase}
              onResumeCase={handleResumeCase}
            />
          );
        return (
          <EmailReview
            userEmail={userEmail}
            parsedData={currentCase.parsedData}
            onSend={handleSendEmail}
            onBack={() => setCurrentScreen("strategy")}
          />
        );
      case "email-sent":
        if (!currentCase)
          return (
            <Dashboard
              onStartNewAppeal={handleStartNewAppeal}
              cases={cases}
              insurancePlans={insurancePlans}
              onViewCase={handleViewCase}
              onResumeCase={handleResumeCase}
            />
          );
        return (
          <EmailSent
            case={currentCase}
            onViewReply={handleViewReply}
            onBackToDashboard={() => setCurrentScreen("dashboard")}
          />
        );
      case "reply-received":
        if (!currentCase)
          return (
            <Dashboard
              onStartNewAppeal={handleStartNewAppeal}
              cases={cases}
              insurancePlans={insurancePlans}
              onViewCase={handleViewCase}
              onResumeCase={handleResumeCase}
            />
          );
        return (
          <ReplyReceived
            case={currentCase}
            onDraftFollowup={() => setCurrentScreen("followup-review")}
            onBack={() => setCurrentScreen("email-sent")}
          />
        );
      case "followup-review":
        if (!currentCase)
          return (
            <Dashboard
              onStartNewAppeal={handleStartNewAppeal}
              cases={cases}
              insurancePlans={insurancePlans}
              onViewCase={handleViewCase}
              onResumeCase={handleResumeCase}
            />
          );
        return (
          <FollowupReview
            userEmail={userEmail}
            onSend={handleSendEmail}
            onBack={() => setCurrentScreen("reply-received")}
          />
        );
      case "settings":
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
      <Sidebar currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      <div className="flex-1">{renderScreen()}</div>
    </div>
  );
}
