import { useState } from "react";
import { FileText, Plus, Trash2, CheckCircle2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import type { Case } from "../App";

type MyCasesProps = {
  cases: Case[];
  onViewCase: (caseId: string) => void;
  onResumeCase: (caseId: string) => void;
  onStartNew: () => void;
  onDeleteCase: (caseId: string) => void;
  onResolveCase: (caseId: string, feedback?: string) => void;
};

export function MyCases({
  cases,
  onViewCase,
  onResumeCase,
  onStartNew,
  onDeleteCase,
  onResolveCase,
}: MyCasesProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [filter, setFilter] = useState<"active" | "resolved" | "all">("all");

  const isIncomplete = (caseItem: Case) => {
    return [
      "denial-upload",
      "denial-extracted-info",
      "strategy",
      "email-review",
    ].includes(caseItem.currentStep);
  };

  const handleDeleteClick = (caseId: string) => {
    setSelectedCaseId(caseId);
    setDeleteDialogOpen(true);
  };

  const handleResolveClick = (caseId: string) => {
    setSelectedCaseId(caseId);
    setResolveDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCaseId) {
      onDeleteCase(selectedCaseId);
      setDeleteDialogOpen(false);
      setSelectedCaseId(null);
    }
  };

  const handleConfirmResolve = () => {
    if (selectedCaseId) {
      onResolveCase(selectedCaseId, feedback);
      setResolveDialogOpen(false);
      setSelectedCaseId(null);
      setFeedback("");
    }
  };

  const activeCases = cases.filter((c) => !c.resolved);
  const resolvedCases = cases.filter((c) => c.resolved);

  const getStepText = (step: Case["currentStep"]) => {
    switch (step) {
      case "denial-upload":
        return "Uploading Denial Documents";
      case "denial-extracted-info":
        return "Reviewing Denial Information";
      case "strategy":
        return "Reviewing Strategy";
      case "email-review":
        return "Drafting Email";
      case "email-sent":
        return "Email Sent";
      case "reply-received":
        return "Reply Received";
      case "followup-review":
        return "Drafting Follow-up";
      default:
        return step;
    }
  };

  const getStatusText = (status: Case['status'], resolved?: boolean) => {
    if (resolved) return 'Resolved';
    switch (status) {
      case "uploading":
        return "Uploading";
      case "analyzing":
        return "Analysis Complete";
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

  const getStatusColor = (status: Case['status'], resolved?: boolean) => {
    if (resolved) return 'bg-green-600';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 mb-2">My Cases</h1>
            <p className="text-gray-600">
              Manage and track all your insurance appeals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex bg-white rounded-lg border overflow-hidden">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-2 ${
                  filter === "all" ? "bg-blue-600 text-white" : "text-gray-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-3 py-2 ${
                  filter === "active"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("resolved")}
                className={`px-3 py-2 ${
                  filter === "resolved"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600"
                }`}
              >
                Resolved
              </button>
            </div>
            <Button onClick={onStartNew} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              New Appeal
            </Button>
          </div>
        </div>

        {activeCases.length === 0 && resolvedCases.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-gray-900 mb-2">No Active Cases</h2>
            <p className="text-gray-600 mb-6">
              Upload documents to start your first appeal.
            </p>
            <Button onClick={onStartNew}>
              <Plus className="w-5 h-5 mr-2" />
              Start New Appeal
            </Button>
          </Card>
        ) : (
          <>
            {activeCases.length > 0 && (
              <>
                <h2 className="text-gray-900 mb-4">Active Cases</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {activeCases.map((caseItem) => (
                    <Card
                      key={caseItem.id}
                      className="p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <FileText className="w-8 h-8 text-blue-600" />
                        {caseItem.hasNewEmail && (
                          <Badge variant="destructive" className="animate-pulse">
                            New
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-gray-900 mb-2">
                        {caseItem.parsedData?.insurer || "Insurance Company"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 font-medium">
                        {caseItem.denialReasonTitle}
                      </p>
                      {caseItem.parsedData?.denialReason && caseItem.denialReasonTitle !== caseItem.parsedData.denialReason && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Full Denial Reason</p>
                          <p className="text-sm text-gray-600">{caseItem.parsedData.denialReason}</p>
                        </div>
                      )}
                      <p className="text-gray-500 mb-3">
                        Created {new Date(caseItem.dateCreated).toLocaleDateString()}
                      </p>
                      {isIncomplete(caseItem) ? (
                        <>
                          <Badge className="bg-yellow-600 mb-3">
                            In Progress: {getStepText(caseItem.currentStep)}
                          </Badge>
                          <Button 
                            onClick={() => onResumeCase(caseItem.id)} 
                            className="w-full mt-3"
                          >
                            Resume
                          </Button>
                        </>
                      ) : (
                        <>
                          <Badge className={getStatusColor(caseItem.status, caseItem.resolved) + " mb-3"}>
                            {getStatusText(caseItem.status, caseItem.resolved)}
                          </Badge>
                          <div className="space-y-2 mt-3">
                            <Button 
                              onClick={() => onViewCase(caseItem.id)} 
                              className="w-full"
                              variant="outline"
                            >
                              View Details
                            </Button>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleResolveClick(caseItem.id)} 
                                className="flex-1"
                                variant="default"
                                size="sm"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Resolve
                              </Button>
                              <Button 
                                onClick={() => handleDeleteClick(caseItem.id)} 
                                className="flex-1"
                                variant="destructive"
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </Card>
                  ))}
                </div>
              </>
            )}

            {resolvedCases.length > 0 && (
              <>
                <h2 className="text-gray-900 mb-4">Resolved Cases</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resolvedCases.map((caseItem) => (
                    <Card
                      key={caseItem.id}
                      className="p-6 hover:shadow-lg transition-shadow bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                        <Badge className="bg-green-600">Resolved</Badge>
                      </div>
                      <h3 className="text-gray-900 mb-2">
                        {caseItem.parsedData?.insurer || "Insurance Company"}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 font-medium">
                        {caseItem.denialReasonTitle}
                      </p>
                      {caseItem.parsedData?.denialReason && caseItem.denialReasonTitle !== caseItem.parsedData.denialReason && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Full Denial Reason</p>
                          <p className="text-sm text-gray-600">{caseItem.parsedData.denialReason}</p>
                        </div>
                      )}
                      <p className="text-gray-500 mb-1">
                        Created {new Date(caseItem.dateCreated).toLocaleDateString()}
                      </p>
                      {caseItem.resolvedDate && (
                        <p className="text-gray-500 mb-3">
                          Resolved {new Date(caseItem.resolvedDate).toLocaleDateString()}
                        </p>
                      )}
                      <div className="space-y-2 mt-3">
                        <Button 
                          onClick={() => onViewCase(caseItem.id)} 
                          className="w-full"
                          variant="outline"
                        >
                          View Details
                        </Button>
                        <Button 
                          onClick={() => handleDeleteClick(caseItem.id)} 
                          className="w-full"
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
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

      {/* Resolve Case Dialog with Feedback */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Case</DialogTitle>
            <DialogDescription>
              Mark this case as resolved and optionally provide feedback about
              your experience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="How did your appeal go? Any insights to share?"
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResolveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmResolve}>Mark as Resolved</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
