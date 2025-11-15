import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  type LocalDataset,
  type LocalPlan,
  type LocalUser,
  type LocalCase,
  type LocalCaseStatus,
  type LocalDocument,
  generateLocalId,
  loadLocalDataset,
  persistLocalDataset,
  resetLocalDataset,
} from '../utils/local-data';

export type PlanInput = {
  planName: string;
  insuranceName: string;
  policySummary?: string;
  documents?: Array<Pick<LocalDocument, 'name' | 'type' | 'url'>>;
};

export type UserInput = {
  email: string;
  fullName: string;
  dateOfBirth: string;
  planId?: string;
};

export type CaseInput = {
  userEmail: string;
  planId?: string;
  title: string;
  appealReason?: string;
  providerNotes?: string;
  status?: LocalCaseStatus;
  documents?: Array<Pick<LocalDocument, 'name' | 'type' | 'url'>>;
};

export type LocalDataContextValue = {
  dataset: LocalDataset;
  addPlan: (input: PlanInput) => LocalPlan;
  addUser: (input: UserInput) => LocalUser;
  addCase: (input: CaseInput) => LocalCase;
  updatePlan: (planId: string, updates: PlanUpdate) => void;
  updateUser: (email: string, updates: UserUpdate) => void;
  updateCase: (caseId: string, updates: CaseUpdate) => void;
  removePlan: (planId: string) => void;
  removeUser: (email: string) => void;
  removeCase: (caseId: string) => void;
  resetDataset: () => void;
};

export type PlanUpdate = Partial<PlanInput>;
export type UserUpdate = Partial<Omit<UserInput, 'email'>> & { email?: string };
export type CaseUpdate = Partial<CaseInput>;

const LocalDataContext = createContext<LocalDataContextValue | null>(null);

function normalizeDocuments(docs?: Array<Pick<LocalDocument, 'name' | 'type' | 'url'>>): LocalDocument[] {
  return (docs ?? []).map((doc) => ({
    id: generateLocalId('doc'),
    name: doc.name,
    type: doc.type,
    url: doc.url,
  }));
}

export function LocalDataProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<LocalDataset>(() => loadLocalDataset());

  useEffect(() => {
    persistLocalDataset(dataset);
  }, [dataset]);

  const addPlan = useCallback((input: PlanInput): LocalPlan => {
    const newPlan: LocalPlan = {
      id: generateLocalId('plan'),
      planName: input.planName,
      insuranceName: input.insuranceName,
      policySummary: input.policySummary,
      documents: normalizeDocuments(input.documents),
    };

    setDataset((prev: LocalDataset) => ({
      ...prev,
      plans: [...prev.plans, newPlan],
    }));

    return newPlan;
  }, []);

  const addUser = useCallback((input: UserInput): LocalUser => {
    const newUser: LocalUser = {
      email: input.email.toLowerCase(),
      fullName: input.fullName,
      dateOfBirth: input.dateOfBirth,
      planId: input.planId,
    };

    setDataset((prev: LocalDataset) => ({
      ...prev,
      users: [
        ...prev.users.filter((user: LocalUser) => user.email !== newUser.email),
        newUser,
      ],
    }));

    return newUser;
  }, []);

  const addCase = useCallback((input: CaseInput): LocalCase => {
    const relatedUser = dataset.users.find(
      (user: LocalUser) => user.email === input.userEmail.toLowerCase()
    );
    const casePlanId = input.planId ?? relatedUser?.planId;

    const newCase: LocalCase = {
      id: generateLocalId('case'),
      userEmail: input.userEmail.toLowerCase(),
      planId: casePlanId,
      title: input.title,
      appealReason: input.appealReason,
      providerNotes: input.providerNotes,
      status: input.status ?? 'draft',
      documents: normalizeDocuments(input.documents),
    };

    setDataset((prev: LocalDataset) => ({
      ...prev,
      cases: [...prev.cases, newCase],
    }));

    return newCase;
  }, [dataset.users]);

  const updatePlan = useCallback((planId: string, updates: PlanUpdate) => {
    setDataset((prev: LocalDataset) => ({
      ...prev,
      plans: prev.plans.map((plan: LocalPlan) =>
        plan.id === planId
          ? {
            ...plan,
            ...updates,
            documents: updates.documents ? normalizeDocuments(updates.documents) : plan.documents,
          }
          : plan
      ),
    }));
  }, []);

  const updateUser = useCallback((email: string, updates: UserUpdate) => {
    const normalized = email.toLowerCase();
    setDataset((prev: LocalDataset) => {
      const existing = prev.users.find((user) => user.email === normalized);
      if (!existing) {
        return prev;
      }
      const nextEmail = updates.email?.toLowerCase() ?? existing.email;
      const nextUser: LocalUser = {
        ...existing,
        ...updates,
        email: nextEmail,
      };

      return {
        ...prev,
        users: prev.users.map((user) => (user.email === normalized ? nextUser : user)),
        cases: prev.cases.map((caseItem) =>
          caseItem.userEmail === normalized ? { ...caseItem, userEmail: nextEmail } : caseItem
        ),
      };
    });
  }, []);

  const updateCase = useCallback((caseId: string, updates: CaseUpdate) => {
    setDataset((prev: LocalDataset) => ({
      ...prev,
      cases: prev.cases.map((caseItem: LocalCase) =>
        caseItem.id === caseId
          ? {
            ...caseItem,
            ...updates,
            userEmail: updates.userEmail?.toLowerCase() ?? caseItem.userEmail,
            documents: updates.documents ? normalizeDocuments(updates.documents) : caseItem.documents,
          }
          : caseItem
      ),
    }));
  }, []);

  const removePlan = (planId: string) => {
    setDataset((prev: LocalDataset) => ({
      ...prev,
      plans: prev.plans.filter((plan: LocalPlan) => plan.id !== planId),
      users: prev.users.map((user: LocalUser) =>
        user.planId === planId ? { ...user, planId: undefined } : user
      ),
      cases: prev.cases.filter((caseItem: LocalCase) => caseItem.planId !== planId),
    }));
  };

  const removeUser = (email: string) => {
    const normalized = email.toLowerCase();
    setDataset((prev: LocalDataset) => ({
      ...prev,
      users: prev.users.filter((user: LocalUser) => user.email !== normalized),
      cases: prev.cases.filter((caseItem: LocalCase) => caseItem.userEmail !== normalized),
    }));
  };

  const removeCase = (caseId: string) => {
    setDataset((prev: LocalDataset) => ({
      ...prev,
      cases: prev.cases.filter((caseItem: LocalCase) => caseItem.id !== caseId),
    }));
  };

  const resetDataset = () => {
    resetLocalDataset();
    setDataset(loadLocalDataset());
  };

  const value = useMemo<LocalDataContextValue>(() => ({
    dataset,
    addPlan,
    addUser,
    addCase,
    updatePlan,
    updateUser,
    updateCase,
    removePlan,
    removeUser,
    removeCase,
    resetDataset,
  }), [dataset, addPlan, addCase, addUser, updatePlan, updateUser, updateCase]);

  return (
    <LocalDataContext.Provider value={value}>{children}</LocalDataContext.Provider>
  );
}

export function useLocalData() {
  const context = useContext(LocalDataContext);
  if (!context) {
    throw new Error('useLocalData must be used within a LocalDataProvider');
  }
  return context;
}
