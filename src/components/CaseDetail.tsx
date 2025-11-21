import { useState } from "react";
import {
  ArrowLeft,
  FileText,
  Mail,
  Download,
  Calendar,
  Trash2,
  CheckCircle2,
  Eye,
  Building2,
  Users,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
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
import type { Case, EmailMessage } from "../App";
import type { InsurancePlan } from "./InsurancePlans";

type CaseDetailProps = {
  case: Case;
  plan?: InsurancePlan;
  onBack: () => void;
  onDeleteCase: (caseId: string) => void;
  onResolveCase: (caseId: string, feedback?: string) => void;
  onViewEmailThread: () => void;
};

export function CaseDetail({
  case: caseItem,
  plan,
  onBack,
  onDeleteCase,
  onResolveCase,
  onViewEmailThread,
}: CaseDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const getStatusText = (status: Case["status"], resolved?: boolean) => {
    if (resolved) return "Resolved";
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

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleResolveClick = () => {
    setResolveDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDeleteCase(caseItem.id);
    setDeleteDialogOpen(false);
    onBack();
  };

  const handleConfirmResolve = () => {
    onResolveCase(caseItem.id, feedback);
    setResolveDialogOpen(false);
    setFeedback("");
    onBack();
  };

  const handleViewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setSelectedFileUrl(url);
    setSelectedFileName(file.name);
    setFileDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Button variant="outline" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Cases
        </Button>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {caseItem.parsedData?.insurer || "Insurance Company"}
              </h1>
              <p className="text-lg text-gray-700 mb-2 font-medium">
                {caseItem.denialReasonTitle}
              </p>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Created{" "}
                    {new Date(caseItem.dateCreated).toLocaleDateString()}
                  </span>
                </div>
                {caseItem.parsedData && (
                  <span>Policy #{caseItem.parsedData.policyNumber}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {caseItem.resolved ? (
                <Badge className="bg-green-600">Resolved</Badge>
              ) : (
                <Badge className="bg-blue-600">
                  {getStatusText(caseItem.status, caseItem.resolved)}
                </Badge>
              )}
            </div>
          </div>
          {!caseItem.resolved && (
            <div className="flex gap-2 mt-4">
              <Button onClick={handleResolveClick} variant="default">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Resolved
              </Button>
              <Button onClick={handleDeleteClick} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Case
              </Button>
            </div>
          )}
          {caseItem.resolved && caseItem.resolvedDate && (
            <p className="text-gray-600 mt-2">
              Resolved on {new Date(caseItem.resolvedDate).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="space-y-6">
          {/* Insurance Plan Information */}
          {plan && (
            <Card className="p-6">
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Insurance Plan
              </h2>
              <div className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Plan Name</p>
                    <p className="text-gray-900">{plan.planName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Insurance Company</p>
                    <p className="text-gray-900">{plan.insuranceCompany}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Policy Number</p>
                    <p className="text-gray-900">{plan.policyNumber}</p>
                  </div>
                  {plan.groupNumber && (
                    <div>
                      <p className="text-gray-500">Group Number</p>
                      <p className="text-gray-900">{plan.groupNumber}</p>
                    </div>
                  )}
                </div>
                {caseItem.coveredPersonId && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-gray-500 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Covered Individual for this case
                    </p>
                    <p className="text-gray-900">
                      {plan.coveredIndividuals.find(
                        (p) => p.id === caseItem.coveredPersonId
                      )?.name || "Unknown"}
                      {plan.coveredIndividuals.find(
                        (p) => p.id === caseItem.coveredPersonId
                      )?.relationship &&
                        ` (${
                          plan.coveredIndividuals.find(
                            (p) => p.id === caseItem.coveredPersonId
                          )?.relationship
                        })`}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Uploaded Documents */}
          <Card className="p-6">
            <h2 className="text-gray-900 mb-4">Uploaded Documents</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-700 mb-2">Denial Documents</p>
                {caseItem.denialFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-900">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewFile(file)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewFile(file)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Policy documents now live on the InsurancePlan, so we don't show them from the Case anymore */}
            </div>
          </Card>

          {/* Extracted Information */}
          {caseItem.parsedData && (
            <Card className="p-6">
              <h2 className="text-gray-900 mb-4">Extracted Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 mb-1">Insurance Company</p>
                  <p className="text-gray-900">{caseItem.parsedData.insurer}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Policy Number</p>
                  <p className="text-gray-900">
                    {caseItem.parsedData.policyNumber}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Denial Reason
                  </h3>
                  <p className="text-gray-700">{`"${caseItem.parsedData.denialReason}"`}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Progress Timeline */}
          <Card className="p-6">
            <h2 className="text-gray-900 mb-4">Progress Timeline</h2>
            <div className="flex items-center justify-between">
              {[
                { label: "Upload", step: 0 },
                { label: "Analysis", step: 1 },
                { label: "Email Sent", step: 2 },
                { label: "Resolved", step: 3 },
              ].map((stage, idx) => {
                const statusIndex = caseItem.resolved
                  ? 3
                  : caseItem.status === "uploading"
                  ? 0
                  : caseItem.status === "analyzing"
                  ? 1
                  : caseItem.status === "sent" ||
                    caseItem.status === "awaiting-reply" ||
                    caseItem.status === "reply-received"
                  ? 2
                  : 1;
                const isDone = idx <= statusIndex;
                const isActive = idx === statusIndex;
                return (
                  <div key={stage.label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                          isDone
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        } ${isActive ? "ring-4 ring-blue-200" : ""}`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <p
                        className={`text-sm mt-2 font-medium ${
                          isDone ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {stage.label}
                      </p>
                    </div>
                    {idx < 3 && (
                      <div
                        className={`h-1 flex-1 mx-2 ${
                          isDone ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Email Thread */}
          {caseItem.emailThread.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-gray-900 mb-1">Email Communication</h2>
                  <p className="text-sm text-gray-600">
                    {caseItem.emailThread.length}{" "}
                    {caseItem.emailThread.length === 1 ? "message" : "messages"}{" "}
                    in thread
                  </p>
                </div>
                <Button onClick={onViewEmailThread} size="lg">
                  <Mail className="w-5 h-5 mr-2" />
                  View Email Thread
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-900 font-medium mb-1">
                      Latest:{" "}
                      {
                        caseItem.emailThread[caseItem.emailThread.length - 1]
                          .subject
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      {caseItem.emailThread[caseItem.emailThread.length - 1]
                        .type === "sent"
                        ? "Sent"
                        : "Received"}{" "}
                      on{" "}
                      {new Date(
                        caseItem.emailThread[
                          caseItem.emailThread.length - 1
                        ].date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
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

      {/* Resolve Case Dialog */}
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
