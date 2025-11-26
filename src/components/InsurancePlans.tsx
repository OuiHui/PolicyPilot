import {
  Building2,
  Users,
  Plus,
  Pencil,
  FileText,
  Calendar,
  Trash2,
  Eye,
  Download,
  Upload,
} from "lucide-react";
import { useState } from "react";
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
import { apiUrl } from "../config";
import { formatPolicyType } from "../utils/format";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

export type CoveredPerson = {
  id: string;
  name: string;
  dateOfBirth: string;
  relationship: "Self" | "Spouse" | "Child" | "Dependent" | "Other";
};

export type InsurancePlan = {
  id: string;
  insuranceCompany: string;
  planName: string;
  policyNumber: string;
  groupNumber?: string;
  policyType: "comprehensive" | "supplementary";
  policyFiles: (File | { name: string; size: number; type: string; bucket?: string; path?: string })[];
  coveredIndividuals: CoveredPerson[];
  dateAdded: string;
};

type InsurancePlansProps = {
  plans: InsurancePlan[];
  onAddPlan: () => void;
  onEditPlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
};

export function InsurancePlans({
  plans,
  onAddPlan,
  onEditPlan,
  onDeletePlan,
}: InsurancePlansProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleViewFile = async (file: File | { name: string; size: number; type: string; bucket?: string; path?: string }) => {
    try {
      let url: string;
      const fileName = file.name;

      if (file instanceof File) {
        url = URL.createObjectURL(file);
      } else if (file.bucket && file.path) {
        const response = await fetch(apiUrl('/api/files/signed-url'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bucket: file.bucket, path: file.path })
        });

        if (!response.ok) throw new Error('Failed to get file URL');
        const data = await response.json();
        url = data.signedUrl;
      } else {
        console.warn('File missing storage metadata:', file);
        alert('Cannot view this document. It may have been uploaded before storage was configured.');
        return;
      }

      setSelectedFileUrl(url);
      setSelectedFileName(fileName);
      setFileDialogOpen(true);
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Failed to load file');
    }
  };

  const handleRemoveFile = async (plan: InsurancePlan, index: number) => {
    if (!confirm('Remove this document?')) return;

    const fileToRemove = plan.policyFiles[index];
    const updatedFiles = plan.policyFiles.filter((_, i) => i !== index);

    try {
      if (!(fileToRemove instanceof File) && fileToRemove.bucket && fileToRemove.path) {
        const { supabase } = await import('../utils/supabase/client');
        if (supabase) {
          await supabase.storage.from(fileToRemove.bucket).remove([fileToRemove.path]);
        }
      }

      const response = await fetch(apiUrl(`/api/plans/${plan.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyFiles: updatedFiles })
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to remove file');
      }
    } catch (error) {
      console.error('Error removing file:', error);
      alert('Failed to remove file');
    }
  };

  const handleDeleteClick = (planId: string) => {
    setPlanToDelete(planId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (planToDelete) {
      onDeletePlan(planToDelete);
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">
              Manage Your Insurance Plans
            </h1>
            <p className="text-gray-600">
              Store your insurance information once, use it for multiple appeals
            </p>
          </div>
          <Button onClick={onAddPlan} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Insurance Plan
          </Button>
        </div>

        {plans.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl text-gray-900 mb-2">
              No Insurance Plans Yet
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Add your insurance plan information to streamline future appeals.
              You'll only need to upload your policy documents once.
            </p>
            <Button onClick={onAddPlan} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Plan
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-900">{plan.planName}</h3>
                      <p className="text-gray-600">{plan.insuranceCompany}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditPlan(plan.id)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteClick(plan.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>Policy: {plan.policyNumber}</span>
                  </div>
                  {plan.groupNumber && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>Group: {plan.groupNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                      {plan.coveredIndividuals.length} covered{" "}
                      {plan.coveredIndividuals.length === 1
                        ? "individual"
                        : "individuals"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Added {new Date(plan.dateAdded).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium text-gray-700">Policy Documents</p>
                  {plan.policyFiles.length > 0 ? (
                    plan.policyFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate text-gray-700">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewFile(file)}
                            title="View document"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveFile(plan, index)}
                            title="Remove document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No documents uploaded</p>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-gray-500 mb-2">Covered Individuals:</p>
                  <div className="space-y-1">
                    {plan.coveredIndividuals.slice(0, 3).map((person) => (
                      <div
                        key={person.id}
                        className="flex items-center gap-2 text-gray-600"
                      >
                        <Users className="w-3 h-3" />
                        <span>
                          {person.name} ({person.relationship})
                        </span>
                      </div>
                    ))}
                    {plan.coveredIndividuals.length > 3 && (
                      <p className="text-gray-500">
                        +{plan.coveredIndividuals.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Insurance Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this insurance plan and remove it from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlanToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
        <DialogContent
          className="p-0"
          style={{
            maxWidth: '95vw',
            width: '95vw',
            height: '95vh',
            maxHeight: '95vh'
          }}
        >
          <DialogHeader>
            <DialogTitle>{selectedFileName}</DialogTitle>
            <DialogDescription>
              Viewing document securely
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 h-full min-h-[60vh] bg-gray-100 rounded-md overflow-hidden">
            {selectedFileUrl ? (
              <iframe
                src={selectedFileUrl}
                className="w-full h-full border-0"
                title="Document Viewer"
                allow="fullscreen"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading document...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}
