import { supabase, isSupabaseConfigured } from './client';

export type InsurancePlanRow = {
  plan_id: string;
  plan_name: string;
  insurance_name: string;
  policy_summary: string | null;
  policy_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type PlanPolicyDocumentRow = {
  document_id: string;
  plan_id: string;
  document_name: string;
  document_type: string | null;
  document_url: string | null;
  storage_path: string | null;
  uploaded_at: string;
};

export type UserRow = {
  email: string;
  full_name: string;
  date_of_birth: string;
  insurance_plan_id: string | null;
  created_at: string;
  updated_at: string;
};

export type InsuranceCaseRow = {
  case_id: string;
  patient_email: string;
  insurance_plan_id: string;
  case_title: string | null;
  appeal_reason: string | null;
  provider_notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type CaseDocumentRow = {
  document_id: string;
  case_id: string;
  document_name: string;
  document_type: string | null;
  document_url: string | null;
  storage_path: string | null;
  uploaded_at: string;
};

export type CaseWithDocuments = InsuranceCaseRow & {
  documents: CaseDocumentRow[];
};

export type PlanWithDocuments = InsurancePlanRow & {
  documents: PlanPolicyDocumentRow[];
};

export type DashboardUser = UserRow & {
  plan: PlanWithDocuments | null;
  cases: CaseWithDocuments[];
};

export type DashboardPlan = PlanWithDocuments & {
  members: Array<Pick<UserRow, 'email' | 'full_name' | 'date_of_birth'>>;
};

export type DashboardData = {
  users: DashboardUser[];
  plans: DashboardPlan[];
};

export async function fetchDashboardData(): Promise<DashboardData> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  const [usersRes, casesRes, plansRes, planDocsRes, caseDocsRes] = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('insurance_cases').select('*'),
    supabase.from('insurance_plans').select('*'),
    supabase.from('plan_policy_documents').select('*'),
    supabase.from('case_documents').select('*'),
  ]);

  const firstError = usersRes.error
    ?? casesRes.error
    ?? plansRes.error
    ?? planDocsRes.error
    ?? caseDocsRes.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const usersData = (usersRes.data ?? []) as UserRow[];
  const casesData = (casesRes.data ?? []) as InsuranceCaseRow[];
  const plansData = (plansRes.data ?? []) as InsurancePlanRow[];
  const planDocsData = (planDocsRes.data ?? []) as PlanPolicyDocumentRow[];
  const caseDocsData = (caseDocsRes.data ?? []) as CaseDocumentRow[];

  const plansWithDocs = plansData.map((plan) => ({
    ...plan,
    policy_metadata: plan.policy_metadata ?? {},
    documents: planDocsData.filter((doc) => doc.plan_id === plan.plan_id),
  }));

  const planMap = new Map<string, PlanWithDocuments>();
  plansWithDocs.forEach((plan) => planMap.set(plan.plan_id, plan));

  const caseDocsByCase = new Map<string, CaseDocumentRow[]>();
  caseDocsData.forEach((doc) => {
    const existing = caseDocsByCase.get(doc.case_id) ?? [];
    existing.push(doc);
    caseDocsByCase.set(doc.case_id, existing);
  });

  const casesWithDocs: CaseWithDocuments[] = casesData.map((caseRow) => ({
    ...caseRow,
    documents: caseDocsByCase.get(caseRow.case_id) ?? [],
  }));

  const casesByPatient = new Map<string, CaseWithDocuments[]>();
  casesWithDocs.forEach((caseRow) => {
    const existing = casesByPatient.get(caseRow.patient_email) ?? [];
    existing.push(caseRow);
    casesByPatient.set(caseRow.patient_email, existing);
  });

  const planMembersMap = new Map<string, Array<Pick<UserRow, 'email' | 'full_name' | 'date_of_birth'>>>();

  const users: DashboardUser[] = usersData.map((user) => {
    const plan = user.insurance_plan_id ? planMap.get(user.insurance_plan_id) ?? null : null;
    if (plan) {
      const members = planMembersMap.get(plan.plan_id) ?? [];
      members.push({
        email: user.email,
        full_name: user.full_name,
        date_of_birth: user.date_of_birth,
      });
      planMembersMap.set(plan.plan_id, members);
    }

    return {
      ...user,
      plan,
      cases: casesByPatient.get(user.email) ?? [],
    };
  });

  const plans: DashboardPlan[] = plansWithDocs.map((plan) => ({
    ...plan,
    members: planMembersMap.get(plan.plan_id) ?? [],
  }));

  return { users, plans };
}
