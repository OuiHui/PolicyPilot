import { useState } from "react";
import {
  Shield,
  Upload,
  Lightbulb,
  Send,
  ArrowRight,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import type { Case } from "../App";

type DashboardProps = {
  onStartNewAppeal: () => void;
  cases: Case[];
  insurancePlans: any[];
  onViewCase: (caseId: string) => void;
  onResumeCase: (caseId: string) => void;
  onDeleteCase: (caseId: string) => void;
};

export function Dashboard({
  onStartNewAppeal,
  cases,
  insurancePlans,
  onViewCase,
  onResumeCase,
  onDeleteCase,
}: DashboardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const steps = [
    {
      number: 1,
      icon: Upload,
      title: "Upload & Analyze",
      description:
        "Upload your denial letter and policy. Our AI extracts key information instantly.",
    },
    {
      number: 2,
      icon: Lightbulb,
      title: "Understand Your Strategy",
      description:
        "Get a detailed analysis of why you were denied and how to respond.",
    },
    {
      number: 3,
      icon: Send,
      title: "Automate Your Outreach",
      description:
        "Review and send professionally crafted appeals directly from your email.",
    },
  ];

  const recentCases = cases.slice(-3).reverse();

  const isIncomplete = (caseItem: Case) => {
    return [
      "denial-upload",
      "denial-extracted-info",
      "strategy",
      "email-review",
    ].includes(caseItem.currentStep);
  };

  // Helper functions to map plan and patient names
  const getPlanName = (caseItem: Case) => {
    const plan = insurancePlans.find((p) => p.id === caseItem.planId);
    return plan?.planName || "Unknown Plan";
  };

  const getPatientName = (caseItem: Case) => {
    const plan = insurancePlans.find((p) => p.id === caseItem.planId);
    if (!plan) return "Unknown Patient";
    const covered = plan.coveredIndividuals?.find(
      (person: any) => person.id === caseItem.coveredPersonId
    );
    return covered ? covered.name : "Unknown Patient";
  };

  const getStatusText = (status: Case["status"]) => {
    switch (status) {
      case "uploading":
        return "Uploading";
      case "analyzing":
        return "Analyzing";
      case "ready-to-send":
        return "Ready to Send";
      case "sent":
        return "Sent";
      case "awaiting-reply":
        return "Awaiting Reply";
      case "reply-received":
        return "Reply Received";
      default:
        return status;
    }
  };

  const getStatusColor = (status: Case["status"]) => {
    switch (status) {
      case "analyzing":
        return "bg-blue-600";
      case "ready-to-send":
        return "bg-green-600";
      case "sent":
      case "awaiting-reply":
        return "bg-orange-600";
      case "reply-received":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  const handleDeleteClick = (caseId: string) => {
    setSelectedCaseId(caseId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCaseId) {
      onDeleteCase(selectedCaseId);
      setDeleteDialogOpen(false);
      setSelectedCaseId(null);
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
          <p className="text-xl text-gray-600 mb-6 max-w-2xl">
            Navigate the complex appeals process with AI-powered guidance. We
            analyze your denial, find conflicting policy provisions, and help
            you craft compelling appeals.
          </p>
          <Button onClick={onStartNewAppeal} className="px-8" size="lg">
            Start New Appeal
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Recent Cases */}
        {recentCases.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Recent Cases
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {recentCases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className={`p-6 hover:shadow-lg transition-shadow ${caseItem.resolved ? "bg-gray-50" : ""
                    }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <FileText
                      className={`w-8 h-8 ${caseItem.resolved ? "text-gray-400" : "text-blue-600"
                        }`}
                    />
                    <div className="flex gap-2">
                      {caseItem.hasNewEmail && !caseItem.resolved && (
                        <Badge variant="destructive" className="animate-pulse">
                          New
                        </Badge>
                      )}
                      <Badge className={getStatusColor(caseItem.status)}>
                        {getStatusText(caseItem.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">For:</span>{" "}
                      <span className="text-gray-900">
                        {getPatientName(caseItem)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">
                        Issue:
                      </span>{" "}
                      <span className="text-gray-900">
                        {caseItem.denialReasonTitle}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700">Plan:</span>{" "}
                      <span className="text-gray-900">
                        {getPlanName(caseItem)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-4">
                    Created{" "}
                    {new Date(caseItem.dateCreated).toLocaleDateString()}
                    {caseItem.resolvedDate && (
                      <>
                        {" "}
                        • Resolved{" "}
                        {new Date(caseItem.resolvedDate).toLocaleDateString()}
                      </>
                    )}
                  </p>

                  {isIncomplete(caseItem) ? (
                    <>
                      <Badge className="bg-yellow-600 mb-3 w-full justify-center">
                        In Progress: {caseItem.currentStep}
                      </Badge>
                      <div className="space-y-2">
                        <Button
                          onClick={() => onResumeCase(caseItem.id)}
                          className="w-full"
                        >
                          Resume
                        </Button>
                        {!caseItem.resolved && (
                          <Button
                            onClick={() => handleDeleteClick(caseItem.id)}
                            className="w-full"
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={() => onViewCase(caseItem.id)}
                        className="w-full"
                        variant="outline"
                      >
                        View Details
                      </Button>
                      {!caseItem.resolved && (
                        <Button
                          onClick={() => handleDeleteClick(caseItem.id)}
                          className="w-full"
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-sm font-semibold mb-2 text-blue-600">
                    Step {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Case?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              case and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
