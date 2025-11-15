import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { PlusCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useLocalData } from '../context/LocalDataContext';
import type { LocalCaseStatus } from '../utils/local-data';

const caseStatuses: LocalCaseStatus[] = ['draft', 'submitted', 'in_review', 'resolved', 'closed'];

const docsFromTextarea = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name) => ({ name }));

const initialPlanForm = {
  planName: '',
  insuranceName: '',
  policySummary: '',
  documentNames: '',
};

const initialUserForm = {
  email: '',
  fullName: '',
  dateOfBirth: '',
  planId: '',
};

const initialCaseForm = {
  userEmail: '',
  planId: '',
  title: '',
  appealReason: '',
  providerNotes: '',
  status: 'draft' as LocalCaseStatus,
  documentNames: '',
};

const emptyPlanEditor = {
  planName: '',
  insuranceName: '',
  policySummary: '',
  documentNames: '',
};

const emptyUserEditor = {
  email: '',
  fullName: '',
  dateOfBirth: '',
  planId: '',
};

const emptyCaseEditor = {
  caseId: '',
  userEmail: '',
  planId: '',
  title: '',
  appealReason: '',
  providerNotes: '',
  status: 'draft' as LocalCaseStatus,
  documentNames: '',
};

const planMemberFormInitial = {
  email: '',
  fullName: '',
  dateOfBirth: '',
};

const userCaseFormInitial = {
  title: '',
  appealReason: '',
  providerNotes: '',
  status: 'draft' as LocalCaseStatus,
  planId: '',
  documentNames: '',
};

export function LocalDataManager() {
  const {
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
  } = useLocalData();

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState(initialPlanForm);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [caseForm, setCaseForm] = useState(initialCaseForm);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showCaseForm, setShowCaseForm] = useState(false);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(dataset.plans[0]?.id ?? null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(dataset.users[0]?.email ?? null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(dataset.cases[0]?.id ?? null);

  useEffect(() => {
    if (!selectedPlanId && dataset.plans.length > 0) {
      setSelectedPlanId(dataset.plans[0].id);
    } else if (selectedPlanId && !dataset.plans.some((plan) => plan.id === selectedPlanId)) {
      setSelectedPlanId(dataset.plans[0]?.id ?? null);
    }
  }, [dataset.plans, selectedPlanId]);

  useEffect(() => {
    if (!selectedUserEmail && dataset.users.length > 0) {
      setSelectedUserEmail(dataset.users[0].email);
    } else if (
      selectedUserEmail
      && !dataset.users.some((user) => user.email === selectedUserEmail)
    ) {
      setSelectedUserEmail(dataset.users[0]?.email ?? null);
    }
  }, [dataset.users, selectedUserEmail]);

  useEffect(() => {
    if (!selectedCaseId && dataset.cases.length > 0) {
      setSelectedCaseId(dataset.cases[0].id);
    } else if (selectedCaseId && !dataset.cases.some((caseItem) => caseItem.id === selectedCaseId)) {
      setSelectedCaseId(dataset.cases[0]?.id ?? null);
    }
  }, [dataset.cases, selectedCaseId]);

  const selectedPlan = useMemo(
    () => dataset.plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [dataset.plans, selectedPlanId]
  );
  const selectedUser = useMemo(
    () => dataset.users.find((user) => user.email === selectedUserEmail) ?? null,
    [dataset.users, selectedUserEmail]
  );
  const selectedCase = useMemo(
    () => dataset.cases.find((caseItem) => caseItem.id === selectedCaseId) ?? null,
    [dataset.cases, selectedCaseId]
  );

  const [planEditor, setPlanEditor] = useState(emptyPlanEditor);
  useEffect(() => {
    if (selectedPlan) {
      setPlanEditor({
        planName: selectedPlan.planName,
        insuranceName: selectedPlan.insuranceName,
        policySummary: selectedPlan.policySummary ?? '',
        documentNames: selectedPlan.documents.map((doc) => doc.name).join('\n'),
      });
    } else {
      setPlanEditor(emptyPlanEditor);
    }
  }, [selectedPlan]);

  const [userEditor, setUserEditor] = useState(emptyUserEditor);
  useEffect(() => {
    if (selectedUser) {
      setUserEditor({
        email: selectedUser.email,
        fullName: selectedUser.fullName,
        dateOfBirth: selectedUser.dateOfBirth,
        planId: selectedUser.planId ?? '',
      });
    } else {
      setUserEditor(emptyUserEditor);
    }
  }, [selectedUser]);

  const [caseEditor, setCaseEditor] = useState(emptyCaseEditor);
  useEffect(() => {
    if (selectedCase) {
      setCaseEditor({
        caseId: selectedCase.id,
        userEmail: selectedCase.userEmail,
        planId: selectedCase.planId ?? '',
        title: selectedCase.title,
        appealReason: selectedCase.appealReason ?? '',
        providerNotes: selectedCase.providerNotes ?? '',
        status: selectedCase.status,
        documentNames: selectedCase.documents.map((doc) => doc.name).join('\n'),
      });
    } else {
      setCaseEditor(emptyCaseEditor);
    }
  }, [selectedCase]);

  const planMembers = useMemo(
    () => (selectedPlan ? dataset.users.filter((user) => user.planId === selectedPlan.id) : []),
    [dataset.users, selectedPlan]
  );

  const [planMemberSelect, setPlanMemberSelect] = useState('');
  useEffect(() => {
    setPlanMemberSelect('');
  }, [selectedPlanId]);

  const availableMembers = useMemo(
    () => (selectedPlan ? dataset.users.filter((user) => user.planId !== selectedPlan.id) : dataset.users),
    [dataset.users, selectedPlan]
  );

  const [planMemberForm, setPlanMemberForm] = useState(planMemberFormInitial);
  useEffect(() => {
    setPlanMemberForm(planMemberFormInitial);
  }, [selectedPlanId]);

  const userCases = useMemo(
    () => (selectedUser ? dataset.cases.filter((caseItem) => caseItem.userEmail === selectedUser.email) : []),
    [dataset.cases, selectedUser]
  );

  const [userCaseForm, setUserCaseForm] = useState(userCaseFormInitial);
  useEffect(() => {
    if (selectedUser) {
      setUserCaseForm((prev) => ({
        ...prev,
        planId: selectedUser.planId ?? '',
        status: 'draft',
        title: '',
        appealReason: '',
        providerNotes: '',
        documentNames: '',
      }));
    } else {
      setUserCaseForm(userCaseFormInitial);
    }
  }, [selectedUser]);

  const handlePlanCreate = (event: FormEvent) => {
    event.preventDefault();
    if (!planForm.planName || !planForm.insuranceName) {
      setStatusMessage('Plan name and insurance carrier are required.');
      return;
    }
    const newPlan = addPlan({
      planName: planForm.planName,
      insuranceName: planForm.insuranceName,
      policySummary: planForm.policySummary || undefined,
      documents: docsFromTextarea(planForm.documentNames),
    });
    setPlanForm(initialPlanForm);
    setStatusMessage('Plan saved locally.');
    setSelectedPlanId(newPlan.id);
    setShowPlanForm(false);
  };

  const handlePlanUpdate = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedPlan) {
      return;
    }
    updatePlan(selectedPlan.id, {
      planName: planEditor.planName,
      insuranceName: planEditor.insuranceName,
      policySummary: planEditor.policySummary || undefined,
      documents: docsFromTextarea(planEditor.documentNames),
    });
    setStatusMessage('Plan updated.');
  };

  const handleUserCreate = (event: FormEvent) => {
    event.preventDefault();
    if (!userForm.email || !userForm.fullName || !userForm.dateOfBirth) {
      setStatusMessage('Email, name, and DOB are required.');
      return;
    }
    const newUser = addUser({
      email: userForm.email,
      fullName: userForm.fullName,
      dateOfBirth: userForm.dateOfBirth,
      planId: userForm.planId || undefined,
    });
    setUserForm(initialUserForm);
    setStatusMessage('Member saved locally.');
    setSelectedUserEmail(newUser.email);
    setShowUserForm(false);
  };

  const handleUserUpdate = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedUser) {
      return;
    }
    updateUser(selectedUser.email, {
      email: userEditor.email,
      fullName: userEditor.fullName,
      dateOfBirth: userEditor.dateOfBirth,
      planId: userEditor.planId || undefined,
    });
    setSelectedUserEmail(userEditor.email);
    setStatusMessage('Member updated.');
  };

  const handleCaseCreate = (event: FormEvent) => {
    event.preventDefault();
    if (!caseForm.userEmail || !caseForm.title) {
      setStatusMessage('Select a member and enter a title.');
      return;
    }
    const newCase = addCase({
      userEmail: caseForm.userEmail,
      planId: caseForm.planId || undefined,
      title: caseForm.title,
      appealReason: caseForm.appealReason || undefined,
      providerNotes: caseForm.providerNotes || undefined,
      status: caseForm.status,
      documents: docsFromTextarea(caseForm.documentNames),
    });
    setCaseForm(initialCaseForm);
    setStatusMessage('Case saved locally.');
    setSelectedCaseId(newCase.id);
    setShowCaseForm(false);
  };

  const handleCaseUpdate = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCase) {
      return;
    }
    updateCase(selectedCase.id, {
      userEmail: caseEditor.userEmail,
      planId: caseEditor.planId || undefined,
      title: caseEditor.title,
      appealReason: caseEditor.appealReason || undefined,
      providerNotes: caseEditor.providerNotes || undefined,
      status: caseEditor.status,
      documents: docsFromTextarea(caseEditor.documentNames),
    });
    setStatusMessage('Case updated.');
  };

  const handleAssignExistingMember = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedPlan || !planMemberSelect) {
      return;
    }
    updateUser(planMemberSelect, { planId: selectedPlan.id });
    setPlanMemberSelect('');
    setStatusMessage('Member assigned to plan.');
  };

  const handleCreateMemberForPlan = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedPlan) {
      return;
    }
    if (!planMemberForm.email || !planMemberForm.fullName || !planMemberForm.dateOfBirth) {
      setStatusMessage('Email, name, and DOB are required to create a member.');
      return;
    }
    const newMember = addUser({
      email: planMemberForm.email,
      fullName: planMemberForm.fullName,
      dateOfBirth: planMemberForm.dateOfBirth,
      planId: selectedPlan.id,
    });
    setPlanMemberForm(planMemberFormInitial);
    setPlanMemberSelect('');
    setStatusMessage('Member created and linked to plan.');
    setSelectedUserEmail(newMember.email);
  };

  const handleAddCaseForUser = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedUser || !userCaseForm.title) {
      setStatusMessage('Provide a title for the new case.');
      return;
    }
    const newCase = addCase({
      userEmail: selectedUser.email,
      planId: (userCaseForm.planId || selectedUser.planId) ?? undefined,
      title: userCaseForm.title,
      appealReason: userCaseForm.appealReason || undefined,
      providerNotes: userCaseForm.providerNotes || undefined,
      status: userCaseForm.status,
      documents: docsFromTextarea(userCaseForm.documentNames),
    });
    setUserCaseForm((prev) => ({ ...prev, title: '', appealReason: '', providerNotes: '', documentNames: '' }));
    setStatusMessage('Case added for member.');
    setSelectedCaseId(newCase.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-blue-600">Local Sandbox</p>
            <h1 className="text-3xl font-bold text-gray-900">Local Data Manager</h1>
            <p className="mt-1 text-gray-600">
              Create and manage demo users, plans, and cases without touching Supabase.
            </p>
          </div>
          <button
            onClick={() => {
              resetDataset();
              setStatusMessage('Local dataset reset to defaults.');
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" /> Reset Local Data
          </button>
        </div>

        {statusMessage && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {statusMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">Plans</p>
                  <p className="text-lg font-semibold text-gray-900">{dataset.plans.length} total</p>
                </div>
                <button
                  onClick={() => setShowPlanForm((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-sm text-blue-600"
                >
                  <PlusCircle className="h-4 w-4" /> {showPlanForm ? 'Close' : 'Add'}
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {dataset.plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selectedPlanId === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{plan.planName}</p>
                    <p className="text-gray-500">{plan.insuranceName}</p>
                  </button>
                ))}
                {dataset.plans.length === 0 && (
                  <p className="text-sm text-gray-500">No plans yet.</p>
                )}
              </div>
              {showPlanForm && (
                <form onSubmit={handlePlanCreate} className="mt-4 space-y-3">
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Plan name"
                    value={planForm.planName}
                    onChange={(event) => setPlanForm((prev) => ({ ...prev, planName: event.target.value }))}
                  />
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Insurance carrier"
                    value={planForm.insuranceName}
                    onChange={(event) =>
                      setPlanForm((prev) => ({ ...prev, insuranceName: event.target.value }))
                    }
                  />
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Policy summary"
                    value={planForm.policySummary}
                    onChange={(event) =>
                      setPlanForm((prev) => ({ ...prev, policySummary: event.target.value }))
                    }
                  />
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Document names (one per line)"
                    value={planForm.documentNames}
                    onChange={(event) =>
                      setPlanForm((prev) => ({ ...prev, documentNames: event.target.value }))
                    }
                  />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Save Plan
                  </button>
                </form>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">Members</p>
                  <p className="text-lg font-semibold text-gray-900">{dataset.users.length} total</p>
                </div>
                <button
                  onClick={() => setShowUserForm((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-sm text-blue-600"
                >
                  <PlusCircle className="h-4 w-4" /> {showUserForm ? 'Close' : 'Add'}
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {dataset.users.map((user) => (
                  <button
                    key={user.email}
                    onClick={() => setSelectedUserEmail(user.email)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selectedUserEmail === user.email ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{user.fullName}</p>
                    <p className="text-gray-500">{user.email}</p>
                  </button>
                ))}
                {dataset.users.length === 0 && <p className="text-sm text-gray-500">No members yet.</p>}
              </div>
              {showUserForm && (
                <form onSubmit={handleUserCreate} className="mt-4 space-y-3">
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Full name"
                    value={userForm.fullName}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  />
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Email"
                    value={userForm.email}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={userForm.dateOfBirth}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))
                    }
                  />
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={userForm.planId}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, planId: event.target.value }))}
                  >
                    <option value="">No plan</option>
                    {dataset.plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.planName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Save Member
                  </button>
                </form>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">Cases</p>
                  <p className="text-lg font-semibold text-gray-900">{dataset.cases.length} total</p>
                </div>
                <button
                  onClick={() => setShowCaseForm((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-sm text-blue-600"
                >
                  <PlusCircle className="h-4 w-4" /> {showCaseForm ? 'Close' : 'Add'}
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {dataset.cases.map((caseItem) => (
                  <button
                    key={caseItem.id}
                    onClick={() => setSelectedCaseId(caseItem.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      selectedCaseId === caseItem.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{caseItem.title}</p>
                    <p className="text-gray-500">{caseItem.userEmail}</p>
                  </button>
                ))}
                {dataset.cases.length === 0 && <p className="text-sm text-gray-500">No cases yet.</p>}
              </div>
              {showCaseForm && (
                <form onSubmit={handleCaseCreate} className="mt-4 space-y-3">
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={caseForm.userEmail}
                    onChange={(event) => setCaseForm((prev) => ({ ...prev, userEmail: event.target.value }))}
                  >
                    <option value="">Select member</option>
                    {dataset.users.map((user) => (
                      <option key={user.email} value={user.email}>
                        {user.fullName}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={caseForm.planId}
                    onChange={(event) => setCaseForm((prev) => ({ ...prev, planId: event.target.value }))}
                  >
                    <option value="">Use member plan</option>
                    {dataset.plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.planName}
                      </option>
                    ))}
                  </select>
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Case title"
                    value={caseForm.title}
                    onChange={(event) => setCaseForm((prev) => ({ ...prev, title: event.target.value }))}
                  />
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={caseForm.status}
                    onChange={(event) =>
                      setCaseForm((prev) => ({ ...prev, status: event.target.value as LocalCaseStatus }))
                    }
                  >
                    {caseStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Appeal reason"
                    value={caseForm.appealReason}
                    onChange={(event) =>
                      setCaseForm((prev) => ({ ...prev, appealReason: event.target.value }))
                    }
                  />
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Provider notes"
                    value={caseForm.providerNotes}
                    onChange={(event) =>
                      setCaseForm((prev) => ({ ...prev, providerNotes: event.target.value }))
                    }
                  />
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Document names"
                    value={caseForm.documentNames}
                    onChange={(event) =>
                      setCaseForm((prev) => ({ ...prev, documentNames: event.target.value }))
                    }
                  />
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Save Case
                  </button>
                </form>
              )}
            </section>
          </aside>

          <main className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Plan details</h2>
                {selectedPlan && (
                  <button
                    onClick={() => {
                      removePlan(selectedPlan.id);
                      setStatusMessage('Plan deleted.');
                    }}
                    className="inline-flex items-center gap-1 text-sm text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Delete plan
                  </button>
                )}
              </div>
              {selectedPlan ? (
                <div className="mt-4 space-y-6">
                  <form onSubmit={handlePlanUpdate} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Plan Name</label>
                      <input
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        value={planEditor.planName}
                        onChange={(event) => setPlanEditor((prev) => ({ ...prev, planName: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Insurance Carrier</label>
                      <input
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        value={planEditor.insuranceName}
                        onChange={(event) =>
                          setPlanEditor((prev) => ({ ...prev, insuranceName: event.target.value }))
                        }
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm text-gray-600">Policy Summary</label>
                      <textarea
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        rows={3}
                        value={planEditor.policySummary}
                        onChange={(event) =>
                          setPlanEditor((prev) => ({ ...prev, policySummary: event.target.value }))
                        }
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm text-gray-600">Documents (one per line)</label>
                      <textarea
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        rows={2}
                        value={planEditor.documentNames}
                        onChange={(event) =>
                          setPlanEditor((prev) => ({ ...prev, documentNames: event.target.value }))
                        }
                      />
                    </div>
                    <button
                      type="submit"
                      className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
                    >
                      Save Changes
                    </button>
                  </form>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Plan Members</h3>
                      <span className="text-sm text-gray-500">{planMembers.length} linked</span>
                    </div>
                    <div className="space-y-2">
                      {planMembers.map((member) => (
                        <div key={member.email} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">{member.fullName}</p>
                            <p className="text-gray-500">{member.email}</p>
                          </div>
                          <button
                            onClick={() => {
                              updateUser(member.email, { planId: undefined });
                              setStatusMessage('Member removed from plan.');
                            }}
                            className="text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {planMembers.length === 0 && (
                        <p className="text-sm text-gray-500">No members assigned.</p>
                      )}
                    </div>

                    <form onSubmit={handleAssignExistingMember} className="space-y-2">
                      <label className="text-sm text-gray-600">Add existing member</label>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          value={planMemberSelect}
                          onChange={(event) => setPlanMemberSelect(event.target.value)}
                        >
                          <option value="">Select member</option>
                          {availableMembers.map((member) => (
                            <option key={member.email} value={member.email}>
                              {member.fullName}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Add
                        </button>
                      </div>
                    </form>

                    <form onSubmit={handleCreateMemberForPlan} className="space-y-2">
                      <label className="text-sm text-gray-600">Create new member in this plan</label>
                      <input
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Full name"
                        value={planMemberForm.fullName}
                        onChange={(event) =>
                          setPlanMemberForm((prev) => ({ ...prev, fullName: event.target.value }))
                        }
                      />
                      <input
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Email"
                        value={planMemberForm.email}
                        onChange={(event) =>
                          setPlanMemberForm((prev) => ({ ...prev, email: event.target.value }))
                        }
                      />
                      <input
                        type="date"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={planMemberForm.dateOfBirth}
                        onChange={(event) =>
                          setPlanMemberForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))
                        }
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
                      >
                        Add Member
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">Select a plan to view details.</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Member details</h2>
                {selectedUser && (
                  <button
                    onClick={() => {
                      removeUser(selectedUser.email);
                      setStatusMessage('Member deleted.');
                    }}
                    className="inline-flex items-center gap-1 text-sm text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Delete member
                  </button>
                )}
              </div>
              {selectedUser ? (
                <div className="mt-4 space-y-6">
                  <form onSubmit={handleUserUpdate} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Full name</label>
                      <input
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        value={userEditor.fullName}
                        onChange={(event) => setUserEditor((prev) => ({ ...prev, fullName: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Email</label>
                      <input
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        value={userEditor.email}
                        onChange={(event) => setUserEditor((prev) => ({ ...prev, email: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Date of birth</label>
                      <input
                        type="date"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        value={userEditor.dateOfBirth}
                        onChange={(event) =>
                          setUserEditor((prev) => ({ ...prev, dateOfBirth: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">Insurance plan</label>
                      <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        value={userEditor.planId}
                        onChange={(event) => setUserEditor((prev) => ({ ...prev, planId: event.target.value }))}
                      >
                        <option value="">No plan</option>
                        {dataset.plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.planName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
                    >
                      Save Changes
                    </button>
                  </form>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Cases</h3>
                      <span className="text-sm text-gray-500">{userCases.length} linked</span>
                    </div>
                    <div className="space-y-2">
                      {userCases.map((caseItem) => (
                        <div key={caseItem.id} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setSelectedCaseId(caseItem.id)}
                              className="text-left"
                            >
                              <p className="font-semibold text-gray-900">{caseItem.title}</p>
                              <p className="text-gray-500">Status: {caseItem.status}</p>
                            </button>
                            <button
                              onClick={() => {
                                removeCase(caseItem.id);
                                setStatusMessage('Case removed.');
                              }}
                              className="text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      {userCases.length === 0 && (
                        <p className="text-sm text-gray-500">No cases for this member.</p>
                      )}
                    </div>

                    <form onSubmit={handleAddCaseForUser} className="space-y-2 rounded-lg border border-gray-200 p-4">
                      <p className="text-sm font-semibold text-gray-900">Add case for {selectedUser.fullName}</p>
                      <input
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Case title"
                        value={userCaseForm.title}
                        onChange={(event) => setUserCaseForm((prev) => ({ ...prev, title: event.target.value }))}
                      />
                      <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={userCaseForm.status}
                        onChange={(event) =>
                          setUserCaseForm((prev) => ({ ...prev, status: event.target.value as LocalCaseStatus }))
                        }
                      >
                        {caseStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                      <select
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        value={userCaseForm.planId}
                        onChange={(event) => setUserCaseForm((prev) => ({ ...prev, planId: event.target.value }))}
                      >
                        <option value="">Use member plan</option>
                        {dataset.plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.planName}
                          </option>
                        ))}
                      </select>
                      <textarea
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        rows={2}
                        placeholder="Appeal reason"
                        value={userCaseForm.appealReason}
                        onChange={(event) =>
                          setUserCaseForm((prev) => ({ ...prev, appealReason: event.target.value }))
                        }
                      />
                      <textarea
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        rows={2}
                        placeholder="Provider notes"
                        value={userCaseForm.providerNotes}
                        onChange={(event) =>
                          setUserCaseForm((prev) => ({ ...prev, providerNotes: event.target.value }))
                        }
                      />
                      <textarea
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        rows={2}
                        placeholder="Document names"
                        value={userCaseForm.documentNames}
                        onChange={(event) =>
                          setUserCaseForm((prev) => ({ ...prev, documentNames: event.target.value }))
                        }
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
                      >
                        Add Case
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">Select a member to view details.</p>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Case details</h2>
                {selectedCase && (
                  <button
                    onClick={() => {
                      removeCase(selectedCase.id);
                      setStatusMessage('Case deleted.');
                    }}
                    className="inline-flex items-center gap-1 text-sm text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Delete case
                  </button>
                )}
              </div>
              {selectedCase ? (
                <form onSubmit={handleCaseUpdate} className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Case title</label>
                    <input
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      value={caseEditor.title}
                      onChange={(event) => setCaseEditor((prev) => ({ ...prev, title: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Status</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      value={caseEditor.status}
                      onChange={(event) =>
                        setCaseEditor((prev) => ({ ...prev, status: event.target.value as LocalCaseStatus }))
                      }
                    >
                      {caseStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Member</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      value={caseEditor.userEmail}
                      onChange={(event) => setCaseEditor((prev) => ({ ...prev, userEmail: event.target.value }))}
                    >
                      {dataset.users.map((user) => (
                        <option key={user.email} value={user.email}>
                          {user.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Plan</label>
                    <select
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      value={caseEditor.planId}
                      onChange={(event) => setCaseEditor((prev) => ({ ...prev, planId: event.target.value }))}
                    >
                      <option value="">Use member plan</option>
                      {dataset.plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.planName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm text-gray-600">Appeal reason</label>
                    <textarea
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      rows={3}
                      value={caseEditor.appealReason}
                      onChange={(event) =>
                        setCaseEditor((prev) => ({ ...prev, appealReason: event.target.value }))
                      }
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm text-gray-600">Provider notes</label>
                    <textarea
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      rows={3}
                      value={caseEditor.providerNotes}
                      onChange={(event) =>
                        setCaseEditor((prev) => ({ ...prev, providerNotes: event.target.value }))
                      }
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm text-gray-600">Document names</label>
                    <textarea
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      rows={2}
                      value={caseEditor.documentNames}
                      onChange={(event) =>
                        setCaseEditor((prev) => ({ ...prev, documentNames: event.target.value }))
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white"
                  >
                    Save Case
                  </button>
                </form>
              ) : (
                <p className="mt-4 text-sm text-gray-500">Select a case to view details.</p>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
