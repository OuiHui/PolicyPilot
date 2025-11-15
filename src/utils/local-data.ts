export type LocalDocument = {
  id: string;
  name: string;
  type?: string;
  url?: string;
};

export type LocalPlan = {
  id: string;
  planName: string;
  insuranceName: string;
  policySummary?: string;
  documents: LocalDocument[];
};

export type LocalUser = {
  email: string;
  fullName: string;
  dateOfBirth: string;
  planId?: string;
};

export type LocalCaseStatus = 'draft' | 'submitted' | 'in_review' | 'resolved' | 'closed';

export type LocalCase = {
  id: string;
  userEmail: string;
  planId?: string;
  title: string;
  appealReason?: string;
  providerNotes?: string;
  status: LocalCaseStatus;
  documents: LocalDocument[];
};

export type LocalDataset = {
  plans: LocalPlan[];
  users: LocalUser[];
  cases: LocalCase[];
};

const STORAGE_KEY = 'policypilot-local-dataset-v1';

const demoDataset: LocalDataset = {
  plans: [
    {
      id: 'local-plan-1',
      planName: 'Premier Gold PPO',
      insuranceName: 'HealthGuard Insurance',
      policySummary: 'Comprehensive PPO with nationwide coverage and out-of-network reimbursements.',
      documents: [
        {
          id: 'local-plan-doc-1',
          name: 'Summary of Benefits',
          type: 'pdf',
        },
      ],
    },
  ],
  users: [
    {
      email: 'sarah.taylor@example.com',
      fullName: 'Sarah Taylor',
      dateOfBirth: '1986-03-14',
      planId: 'local-plan-1',
    },
  ],
  cases: [
    {
      id: 'local-case-1',
      userEmail: 'sarah.taylor@example.com',
      planId: 'local-plan-1',
      title: 'Physical Therapy Denial',
      appealReason: 'Sessions deemed not medically necessary despite surgeon referral.',
      providerNotes: 'Orthopedic surgeon recommended 12 PT visits post ACL reconstruction.',
      status: 'in_review',
      documents: [
        { id: 'local-case-doc-1', name: 'Denial Letter', type: 'pdf' },
        { id: 'local-case-doc-2', name: 'Provider Notes', type: 'pdf' },
      ],
    },
  ],
};

const isBrowser = typeof window !== 'undefined';

export function loadLocalDataset(): LocalDataset {
  if (!isBrowser) {
    return demoDataset;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoDataset));
      return demoDataset;
    }
    return JSON.parse(raw) as LocalDataset;
  } catch (error) {
    console.warn('Failed to parse local dataset. Reverting to demo data.', error);
    return demoDataset;
  }
}

export function persistLocalDataset(dataset: LocalDataset) {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
}

export function resetLocalDataset() {
  if (!isBrowser) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function generateLocalId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
