import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Shield, Upload, Lightbulb, Send, ArrowRight, FileText, Users, Loader2, Edit2, Trash2, Plus, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import type { Case } from '../App';
import {
  fetchDashboardData,
  type CaseWithDocuments,
  type DashboardData,
  type DashboardPlan,
  type DashboardUser,
  type PlanPolicyDocumentRow,
} from '../utils/supabase/dashboard-data';
import { isSupabaseConfigured } from '../utils/supabase/client';
import { useLocalData } from '../context/LocalDataContext';
import type { LocalDataset } from '../utils/local-data';

type DashboardProps = {
  onStartNewAppeal: () => void;
  cases: Case[];
  onViewCase: (caseId: string) => void;
  onResumeCase: (caseId: string) => void;
};

export function Dashboard({ onStartNewAppeal, cases, onViewCase, onResumeCase }: DashboardProps) {
  const { dataset, updateUser, removeUser, updateCase, removeCase, updatePlan, removePlan, addUser, addCase, addPlan } = useLocalData();
  const [memberData, setMemberData] = useState<DashboardUser[]>([]);
  const [planData, setPlanData] = useState<DashboardPlan[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editingCase, setEditingCase] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddCase, setShowAddCase] = useState<string | null>(null);
  const [showAddPlan, setShowAddPlan] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      setMemberError('Supabase is not configured. Showing local data.');
      setIsLoadingMembers(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingMembers(true);
    fetchDashboardData()
      .then((data: DashboardData) => {
        if (!isMounted) return;
        setMemberData(data.users);
        setPlanData(data.plans);
        setMemberError(null);
      })
      .catch((error: Error) => {
        if (!isMounted) return;
        setMemberError(error.message ?? 'Unable to load Supabase data');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingMembers(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const localDashboardData = useMemo(() => convertLocalDataset(dataset), [dataset]);

  const steps = [
    {
      number: 1,
      icon: Upload,
      title: 'Upload & Analyze',
      description: 'Upload your denial letter and policy. Our AI extracts key information instantly.'
    },
    {
      number: 2,
      icon: Lightbulb,
      title: 'Understand Your Strategy',
      description: 'Get a detailed analysis of why you were denied and how to respond.'
    },
    {
      number: 3,
      icon: Send,
      title: 'Automate Your Outreach',
      description: 'Review and send professionally crafted appeals directly from your email.'
    }
  ];

  const recentCases = useMemo(() => cases.slice(-3).reverse(), [cases]);

  const usingLocalData = useMemo(() => {
    if (!isSupabaseConfigured) return true;
    if (memberError) return true;
    return memberData.length === 0 && localDashboardData.users.length > 0;
  }, [memberError, memberData.length, localDashboardData.users.length]);

  const memberRecords = usingLocalData ? localDashboardData.users : memberData;
  const planRecords = usingLocalData ? localDashboardData.plans : planData;

  const memberSectionTitle = usingLocalData ? 'Member Overview (Local)' : 'Member Overview';

  const formatDate = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isIncomplete = (caseItem: Case) => {
    return ['denial-upload', 'policy-upload', 'extracted-info', 'strategy', 'email-review'].includes(caseItem.currentStep);
  };

  const getStatusText = (status: Case['status'], resolved?: boolean) => {
    if (resolved) return 'Resolved';
    switch (status) {
      case 'uploading': return 'Uploading';
      case 'analyzing': return 'Analyzing';
      case 'ready-to-send': return 'Ready to Send';
      case 'sent': return 'Sent';
      case 'awaiting-reply': return 'Awaiting Reply';
      case 'reply-received': return 'Reply Received';
      default: return status;
    }
  };

  const getStatusColor = (status: Case['status'], resolved?: boolean) => {
    if (resolved) return 'bg-green-600';
    switch (status) {
      case 'analyzing': return 'bg-blue-600';
      case 'ready-to-send': return 'bg-green-600';
      case 'sent': case 'awaiting-reply': return 'bg-orange-600';
      case 'reply-received': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const formatDbStatus = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'submitted': return 'Submitted';
      case 'in_review': return 'In Review';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const getDbStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-600';
      case 'in_review': return 'bg-amber-600';
      case 'resolved': return 'bg-green-600';
      case 'closed': return 'bg-gray-600';
      default: return 'bg-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="text-4xl font-bold text-gray-900 mb-4">
            Challenge Your Insurance Denial with Confidence
          </div>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Navigate the complex appeals process with AI-powered guidance. We analyze your denial, 
            find conflicting policy provisions, and help you craft compelling appeals.
          </p>
          <Button onClick={onStartNewAppeal} className="px-8" size="lg">
            Start New Appeal
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Member Overview */}
          <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">{memberSectionTitle}</h2>
            </div>
            <div className="flex items-center gap-2">
              {isLoadingMembers && (
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing Supabase
                </span>
              )}
              {usingLocalData && (
                <button
                  onClick={() => setShowAddMember((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" /> Add Member
                </button>
              )}
            </div>
          </div>

          {memberError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {memberError}
            </div>
          )}

          {showAddMember && (
            <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">New Member</p>
              <div className="grid gap-3 md:grid-cols-2">
                <input placeholder="Full name" className="rounded border border-gray-300 px-3 py-2 text-sm" id="new-member-name" />
                <input placeholder="Email" className="rounded border border-gray-300 px-3 py-2 text-sm" id="new-member-email" />
                <input type="date" className="rounded border border-gray-300 px-3 py-2 text-sm" id="new-member-dob" />
                <select className="rounded border border-gray-300 px-3 py-2 text-sm" id="new-member-plan">
                  <option value="">No plan</option>
                  {dataset.plans.map((p) => (
                    <option key={p.id} value={p.id}>{p.planName}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    const name = (document.getElementById('new-member-name') as HTMLInputElement)?.value;
                    const email = (document.getElementById('new-member-email') as HTMLInputElement)?.value;
                    const dob = (document.getElementById('new-member-dob') as HTMLInputElement)?.value;
                    const planId = (document.getElementById('new-member-plan') as HTMLSelectElement)?.value;
                    if (name && email && dob) {
                      addUser({ fullName: name, email, dateOfBirth: dob, planId: planId || undefined });
                      setShowAddMember(false);
                    }
                  }}
                  className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowAddMember(false)}
                  className="rounded border border-gray-300 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </Card>
          )}

          {!isLoadingMembers && !memberError && memberRecords.length === 0 && (
            <Card className="p-6">
              <p className="text-gray-600">
                No members found yet. Use Supabase or add sample entries above.
              </p>
            </Card>
          )}          <div className="grid gap-5 lg:grid-cols-2">
            {memberRecords.map((member) => {
              const isEditing = editingMember === member.email;
              const localUser = dataset.users.find((u) => u.email === member.email);
              
              return (
              <Card key={member.email} className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1 flex-1">
                    {isEditing && localUser ? (
                      <div className="space-y-2">
                        <input
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          defaultValue={localUser.fullName}
                          id={`name-${member.email}`}
                        />
                        <input
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          defaultValue={localUser.email}
                          id={`email-${member.email}`}
                        />
                        <input
                          type="date"
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          defaultValue={localUser.dateOfBirth}
                          id={`dob-${member.email}`}
                        />
                        <select
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          defaultValue={localUser.planId ?? ''}
                          id={`plan-${member.email}`}
                        >
                          <option value="">No plan</option>
                          {dataset.plans.map((p) => (
                            <option key={p.id} value={p.id}>{p.planName}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <p className="text-xl font-semibold text-gray-900">{member.full_name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        <p className="text-sm text-gray-600">DOB: {formatDate(member.date_of_birth)}</p>
                      </>
                    )}
                  </div>
                  {usingLocalData && localUser && (
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => {
                              const name = (document.getElementById(`name-${member.email}`) as HTMLInputElement)?.value;
                              const email = (document.getElementById(`email-${member.email}`) as HTMLInputElement)?.value;
                              const dob = (document.getElementById(`dob-${member.email}`) as HTMLInputElement)?.value;
                              const planId = (document.getElementById(`plan-${member.email}`) as HTMLSelectElement)?.value;
                              updateUser(member.email, { fullName: name, email, dateOfBirth: dob, planId: planId || undefined });
                              setEditingMember(null);
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingMember(null)}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingMember(member.email)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${member.full_name}?`)) {
                                removeUser(member.email);
                              }
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {member.plan && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wide text-blue-600">Insurance Plan</span>
                      <span className="text-lg font-semibold text-gray-900">{member.plan.plan_name}</span>
                      <span className="text-sm text-gray-600">{member.plan.insurance_name}</span>
                    </div>
                    {member.plan.policy_summary && (
                      <p className="mt-2 text-sm text-gray-700">{member.plan.policy_summary}</p>
                    )}
                    {member.plan.documents.length > 0 && (
                      <div className="mt-3 text-sm">
                        <p className="font-semibold text-gray-900">Policy Documents</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-gray-700">
                          {member.plan.documents.map((doc) => (
                            <li key={doc.document_id}>
                              {doc.document_url ? (
                                <a
                                  href={doc.document_url}
                                  className="text-blue-600 underline-offset-2 hover:underline"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {doc.document_name}
                                </a>
                              ) : (
                                doc.document_name
                              )}
                              {doc.document_type && <span className="text-gray-500"> ({doc.document_type})</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">Active Cases</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{member.cases.length} case(s)</span>
                      {usingLocalData && localUser && (
                        <button
                          onClick={() => setShowAddCase(member.email)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {showAddCase === member.email && (
                    <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
                      <input
                        placeholder="Case title"
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        id={`new-case-title-${member.email}`}
                      />
                      <textarea
                        placeholder="Appeal reason"
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        rows={2}
                        id={`new-case-reason-${member.email}`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const title = (document.getElementById(`new-case-title-${member.email}`) as HTMLInputElement)?.value;
                            const reason = (document.getElementById(`new-case-reason-${member.email}`) as HTMLTextAreaElement)?.value;
                            if (title) {
                              addCase({ userEmail: member.email, title, appealReason: reason || undefined, status: 'draft' });
                              setShowAddCase(null);
                            }
                          }}
                          className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowAddCase(null)}
                          className="rounded border border-gray-300 px-3 py-1 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {member.cases.length === 0 ? (
                    <p className="text-sm text-gray-500">No appeals linked to this member.</p>
                  ) : (
                    <div className="space-y-3">
                      {member.cases.map((memberCase) => {
                        const isEditingThisCase = editingCase === memberCase.case_id;
                        const localCase = dataset.cases.find((c) => c.id === memberCase.case_id);
                        
                        return (
                        <div key={memberCase.case_id} className="rounded-xl border border-gray-200 p-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              {isEditingThisCase && localCase ? (
                                <input
                                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                                  defaultValue={localCase.title}
                                  id={`case-title-${memberCase.case_id}`}
                                />
                              ) : (
                                <p className="text-base font-semibold text-gray-900">
                                  {memberCase.case_title ?? 'Untitled Case'}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                {isEditingThisCase ? (
                                  <select
                                    className="rounded border border-gray-300 px-2 py-1 text-xs"
                                    defaultValue={localCase?.status ?? 'draft'}
                                    id={`case-status-${memberCase.case_id}`}
                                  >
                                    <option value="draft">Draft</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="in_review">In Review</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                  </select>
                                ) : (
                                  <Badge className={getDbStatusColor(memberCase.status)}>
                                    {formatDbStatus(memberCase.status)}
                                  </Badge>
                                )}
                                {usingLocalData && localCase && (
                                  <div className="flex gap-1">
                                    {isEditingThisCase ? (
                                      <>
                                        <button
                                          onClick={() => {
                                            const title = (document.getElementById(`case-title-${memberCase.case_id}`) as HTMLInputElement)?.value;
                                            const status = (document.getElementById(`case-status-${memberCase.case_id}`) as HTMLSelectElement)?.value as any;
                                            const reason = (document.getElementById(`case-reason-${memberCase.case_id}`) as HTMLTextAreaElement)?.value;
                                            const notes = (document.getElementById(`case-notes-${memberCase.case_id}`) as HTMLTextAreaElement)?.value;
                                            updateCase(memberCase.case_id, { title, status, appealReason: reason || undefined, providerNotes: notes || undefined });
                                            setEditingCase(null);
                                          }}
                                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                                        >
                                          <Check className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => setEditingCase(null)}
                                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => setEditingCase(memberCase.case_id)}
                                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (confirm('Delete this case?')) {
                                              removeCase(memberCase.case_id);
                                            }
                                          }}
                                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">Opened {formatDate(memberCase.created_at)}</p>
                          </div>
                          {isEditingThisCase && localCase ? (
                            <div className="mt-3 space-y-2">
                              <textarea
                                placeholder="Appeal reason"
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                rows={2}
                                defaultValue={localCase.appealReason ?? ''}
                                id={`case-reason-${memberCase.case_id}`}
                              />
                              <textarea
                                placeholder="Provider notes"
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                rows={2}
                                defaultValue={localCase.providerNotes ?? ''}
                                id={`case-notes-${memberCase.case_id}`}
                              />
                            </div>
                          ) : (
                            <dl className="mt-3 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                              <div>
                                <dt className="font-medium text-gray-500">Appeal Reason</dt>
                                <dd>{memberCase.appeal_reason ?? '—'}</dd>
                              </div>
                              <div>
                                <dt className="font-medium text-gray-500">Provider Notes</dt>
                                <dd>{memberCase.provider_notes ?? '—'}</dd>
                              </div>
                            </dl>
                          )}
                          {memberCase.documents.length > 0 && (
                            <div className="mt-3 text-sm">
                              <p className="font-semibold text-gray-900">Provider Documents</p>
                              <ul className="mt-1 list-disc space-y-1 pl-5 text-gray-700">
                                {memberCase.documents.map((doc) => (
                                  <li key={doc.document_id}>
                                    {doc.document_name}
                                    {doc.document_type && <span className="text-gray-500"> ({doc.document_type})</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
              );
            })}
          </div>
        </div>

        {/* Plan Coverage */}
        {(planRecords.length > 0 || (usingLocalData && showAddPlan)) && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Plan Coverage</h2>
              </div>
              {usingLocalData && (
                <button
                  onClick={() => setShowAddPlan((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" /> Add Plan
                </button>
              )}
            </div>
            {showAddPlan && (
              <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
                <p className="text-sm font-semibold text-gray-900 mb-3">New Plan</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <input placeholder="Plan name" className="rounded border border-gray-300 px-3 py-2 text-sm" id="new-plan-name" />
                  <input placeholder="Insurance carrier" className="rounded border border-gray-300 px-3 py-2 text-sm" id="new-plan-carrier" />
                  <textarea placeholder="Policy summary" className="md:col-span-2 rounded border border-gray-300 px-3 py-2 text-sm" rows={2} id="new-plan-summary" />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      const name = (document.getElementById('new-plan-name') as HTMLInputElement)?.value;
                      const carrier = (document.getElementById('new-plan-carrier') as HTMLInputElement)?.value;
                      const summary = (document.getElementById('new-plan-summary') as HTMLTextAreaElement)?.value;
                      if (name && carrier) {
                        addPlan({ planName: name, insuranceName: carrier, policySummary: summary || undefined });
                        setShowAddPlan(false);
                      }
                    }}
                    className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowAddPlan(false)}
                    className="rounded border border-gray-300 px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </Card>
            )}
            <div className="grid gap-5 md:grid-cols-2">
              {planRecords.map((plan) => {
                const isEditingThisPlan = editingPlan === plan.plan_id;
                const localPlan = dataset.plans.find((p) => p.id === plan.plan_id);
                
                return (
                <Card key={plan.plan_id} className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Plan</p>
                      {isEditingThisPlan && localPlan ? (
                        <div className="space-y-2 mt-1">
                          <input
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                            defaultValue={localPlan.planName}
                            id={`plan-name-${plan.plan_id}`}
                          />
                          <input
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                            defaultValue={localPlan.insuranceName}
                            id={`plan-carrier-${plan.plan_id}`}
                          />
                          <textarea
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                            rows={2}
                            defaultValue={localPlan.policySummary ?? ''}
                            id={`plan-summary-${plan.plan_id}`}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-xl font-semibold text-gray-900">{plan.plan_name}</p>
                          <p className="text-sm text-gray-600">{plan.insurance_name}</p>
                          {plan.policy_summary && (
                            <p className="mt-2 text-sm text-gray-600">{plan.policy_summary}</p>
                          )}
                        </>
                      )}
                    </div>
                    {usingLocalData && localPlan && (
                      <div className="flex gap-2">
                        {isEditingThisPlan ? (
                          <>
                            <button
                              onClick={() => {
                                const name = (document.getElementById(`plan-name-${plan.plan_id}`) as HTMLInputElement)?.value;
                                const carrier = (document.getElementById(`plan-carrier-${plan.plan_id}`) as HTMLInputElement)?.value;
                                const summary = (document.getElementById(`plan-summary-${plan.plan_id}`) as HTMLTextAreaElement)?.value;
                                updatePlan(plan.plan_id, { planName: name, insuranceName: carrier, policySummary: summary || undefined });
                                setEditingPlan(null);
                              }}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingPlan(null)}
                              className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingPlan(plan.plan_id)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete ${plan.plan_name}?`)) {
                                  removePlan(plan.plan_id);
                                }
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Covered Members</p>
                    {plan.members.length === 0 ? (
                      <p className="text-sm text-gray-500">No members assigned yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {plan.members.map((member) => (
                          <span
                            key={member.email}
                            className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
                          >
                            {member.full_name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {plan.documents.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Policy Documents</p>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                        {plan.documents.map((doc) => (
                          <li key={doc.document_id}>
                            {doc.document_name}
                            {doc.document_type && <span className="text-gray-500"> ({doc.document_type})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Cases */}
        {recentCases.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Cases</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {recentCases.map((caseItem) => (
                <Card 
                  key={caseItem.id} 
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    {caseItem.hasNewEmail && (
                      <Badge variant="destructive">New</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {caseItem.insuranceCompany}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2 font-medium">
                    {caseItem.denialReasonTitle}
                  </p>
                  <p className="text-gray-500 mb-3">
                    {new Date(caseItem.dateCreated).toLocaleDateString()}
                  </p>
                  <Badge className={getStatusColor(caseItem.status, caseItem.resolved) + " mb-3"}>
                    {getStatusText(caseItem.status, caseItem.resolved)}
                  </Badge>
                  {isIncomplete(caseItem) ? (
                    <Button 
                      onClick={() => onResumeCase(caseItem.id)} 
                      className="w-full mt-3"
                      variant="outline"
                    >
                      Resume
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => onViewCase(caseItem.id)} 
                      className="w-full mt-3"
                      variant="outline"
                    >
                      View Details
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="mb-2 text-blue-600">
                    Step {step.number}
                  </div>
                  <h3 className="text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function convertLocalDataset(dataset: LocalDataset): DashboardData {
  const timestamp = new Date().toISOString();

  const plans: DashboardPlan[] = dataset.plans.map((plan) => ({
    plan_id: plan.id,
    plan_name: plan.planName,
    insurance_name: plan.insuranceName,
    policy_summary: plan.policySummary ?? null,
    policy_metadata: {},
    created_at: timestamp,
    updated_at: timestamp,
    documents: plan.documents.map<PlanPolicyDocumentRow>((doc) => ({
      document_id: doc.id,
      plan_id: plan.id,
      document_name: doc.name,
      document_type: doc.type ?? null,
      document_url: doc.url ?? null,
      storage_path: null,
      uploaded_at: timestamp,
    })),
    members: [],
  }));

  const planMap = new Map<string, DashboardPlan>();
  plans.forEach((plan) => planMap.set(plan.plan_id, plan));

  const cases: CaseWithDocuments[] = dataset.cases.map((caseItem) => ({
    case_id: caseItem.id,
    patient_email: caseItem.userEmail,
    insurance_plan_id: caseItem.planId ?? '',
    case_title: caseItem.title,
    appeal_reason: caseItem.appealReason ?? null,
    provider_notes: caseItem.providerNotes ?? null,
    status: caseItem.status,
    created_at: timestamp,
    updated_at: timestamp,
    documents: caseItem.documents.map((doc) => ({
      document_id: doc.id,
      case_id: caseItem.id,
      document_name: doc.name,
      document_type: doc.type ?? null,
      document_url: doc.url ?? null,
      storage_path: null,
      uploaded_at: timestamp,
    })),
  }));

  const casesByUser = new Map<string, CaseWithDocuments[]>();
  cases.forEach((caseItem) => {
    const existing = casesByUser.get(caseItem.patient_email) ?? [];
    existing.push(caseItem);
    casesByUser.set(caseItem.patient_email, existing);
  });

  const users: DashboardUser[] = dataset.users.map((user) => {
    const plan = user.planId ? planMap.get(user.planId) ?? null : null;
    if (plan) {
      plan.members.push({
        email: user.email,
        full_name: user.fullName,
        date_of_birth: user.dateOfBirth,
      });
    }

    return {
      email: user.email,
      full_name: user.fullName,
      date_of_birth: user.dateOfBirth,
      insurance_plan_id: user.planId ?? null,
      created_at: timestamp,
      updated_at: timestamp,
      plan,
      cases: casesByUser.get(user.email) ?? [],
    };
  });

  return { users, plans };
}
