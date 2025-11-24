import {
  Building2,
  Users,
  Plus,
  Pencil,
  FileText,
  Calendar,
  Trash2,
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
  policyFiles: File[];
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

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">
                    {plan.policyFiles.length}{" "}
                    {plan.policyFiles.length === 1 ? "document" : "documents"}
                  </Badge>
                  <Badge variant="outline">
                    {formatPolicyType(plan.policyType)}
                  </Badge>
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
    </div >
  );
}
