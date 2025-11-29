import { useState } from 'react';
import { ArrowLeft, Save, Plus, X, FileText, Users, Upload, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import type { InsurancePlan, CoveredPerson } from './InsurancePlans';

type EditInsurancePlanProps = {
  plan: InsurancePlan;
  onSave: (updatedPlan: InsurancePlan) => void;
  onBack: () => void;
};

const MAJOR_INSURERS = [
  'UnitedHealthcare',
  'Anthem Blue Cross Blue Shield',
  'Aetna',
  'Cigna',
  'Humana',
  'Kaiser Permanente',
  'Blue Cross Blue Shield',
  'Molina Healthcare',
  'Centene',
  'Other',
];

export function EditInsurancePlan({ plan, onSave, onBack }: EditInsurancePlanProps) {
  const [insuranceCompany, setInsuranceCompany] = useState(plan.insuranceCompany);
  const [customInsurer, setCustomInsurer] = useState(
    MAJOR_INSURERS.includes(plan.insuranceCompany) ? '' : plan.insuranceCompany
  );
  const [planName, setPlanName] = useState(plan.planName);
  const [policyNumber, setPolicyNumber] = useState(plan.policyNumber);
  const [groupNumber, setGroupNumber] = useState(plan.groupNumber || '');
  const [policyFiles, setPolicyFiles] = useState<File[]>(plan.policyFiles);
  const [coveredIndividuals, setCoveredIndividuals] = useState<CoveredPerson[]>(plan.coveredIndividuals);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);
  const [personToDelete, setPersonToDelete] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const pdfFiles = Array.from(selectedFiles).filter(
      (file) => file.type === 'application/pdf'
    );
    setPolicyFiles([...policyFiles, ...pdfFiles]);
    e.target.value = '';
  };

  const handleDeleteFile = (index: number) => {
    setFileToDelete(index);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteFile = () => {
    if (fileToDelete !== null) {
      setPolicyFiles(policyFiles.filter((_, i) => i !== fileToDelete));
      setFileToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeletePerson = (id: string) => {
    setPersonToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePerson = () => {
    if (personToDelete) {
      setCoveredIndividuals(coveredIndividuals.filter((p) => p.id !== personToDelete));
      setPersonToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const addCoveredPerson = () => {
    setCoveredIndividuals([
      ...coveredIndividuals,
      {
        id: Date.now().toString(),
        name: '',
        dateOfBirth: '',
        relationship: 'Spouse',
      },
    ]);
  };

  const updateCoveredPerson = (
    id: string,
    field: keyof CoveredPerson,
    value: string
  ) => {
    setCoveredIndividuals(
      coveredIndividuals.map((person) =>
        person.id === id ? { ...person, [field]: value } : person
      )
    );
  };

  const handleSave = () => {
    const updatedPlan: InsurancePlan = {
      ...plan,
      insuranceCompany:
        insuranceCompany === 'Other' ? customInsurer : insuranceCompany,
      planName,
      policyNumber,
      groupNumber: groupNumber || undefined,
      policyFiles,
      coveredIndividuals,
    };
    onSave(updatedPlan);
  };

  const canSave =
    (insuranceCompany !== 'Other' || customInsurer) &&
    planName &&
    policyNumber &&
    policyFiles.length > 0 &&
    coveredIndividuals.every((p) => p.name && p.dateOfBirth && p.relationship);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Button variant="outline" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Insurance Plans
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Insurance Plan
          </h1>
          <p className="text-gray-600">
            Update your insurance plan information and covered individuals
          </p>
        </div>

        <div className="space-y-6">
          {/* Plan Details */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Plan Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="insuranceCompany">Insurance Company *</Label>
                <Select
                  value={insuranceCompany}
                  onValueChange={setInsuranceCompany}
                >
                  <SelectTrigger id="insuranceCompany" className="mt-2">
                    <SelectValue placeholder="Select insurance company" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAJOR_INSURERS.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {insuranceCompany === 'Other' && (
                <div>
                  <Label htmlFor="customInsurer">Custom Insurance Company Name *</Label>
                  <Input
                    id="customInsurer"
                    value={customInsurer}
                    onChange={(e) => setCustomInsurer(e.target.value)}
                    placeholder="Enter insurance company name"
                    className="mt-2"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="planName">Plan Name *</Label>
                <Input
                  id="planName"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g., PPO Gold 2024"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="policyNumber">Policy Number *</Label>
                <Input
                  id="policyNumber"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  placeholder="e.g., ABC123456789"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="groupNumber">Group Number (Optional)</Label>
                <Input
                  id="groupNumber"
                  value={groupNumber}
                  onChange={(e) => setGroupNumber(e.target.value)}
                  placeholder="e.g., GRP987654"
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Policy Documents */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Policy Documents</h2>
              </div>
              <label>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Document
                  </span>
                </Button>
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Badge variant="outline" className="capitalize">
                  {plan.policyType}
                </Badge>
                <span>•</span>
                <span>{policyFiles.length} {policyFiles.length === 1 ? 'document' : 'documents'}</span>
              </div>

              {policyFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-900">{file.name}</span>
                    <span className="text-sm text-gray-500">
                      ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}

              {policyFiles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No documents uploaded. Add at least one policy document.
                </div>
              )}
            </div>
          </Card>

          {/* Covered Individuals */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Covered Individuals ({coveredIndividuals.length})
                </h2>
              </div>
              <Button variant="outline" size="sm" onClick={addCoveredPerson}>
                <Plus className="w-4 h-4 mr-2" />
                Add Person
              </Button>
            </div>

            <div className="space-y-4">
              {coveredIndividuals.map((person, index) => (
                <Card key={person.id} className="p-4 bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label>Name *</Label>
                          <Input
                            placeholder="Full name"
                            value={person.name}
                            onChange={(e) =>
                              updateCoveredPerson(person.id, 'name', e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Date of Birth *</Label>
                          <Input
                            type="date"
                            value={person.dateOfBirth}
                            onChange={(e) =>
                              updateCoveredPerson(
                                person.id,
                                'dateOfBirth',
                                e.target.value
                              )
                            }
                            className="mt-1 no-calendar-picker"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Relationship *</Label>
                        <Select
                          value={person.relationship}
                          onValueChange={(value) =>
                            updateCoveredPerson(person.id, 'relationship', value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Self">
                              Self (Primary Policyholder)
                            </SelectItem>
                            <SelectItem value="Spouse">Spouse</SelectItem>
                            <SelectItem value="Child">Child</SelectItem>
                            <SelectItem value="Dependent">Dependent</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {coveredIndividuals.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePerson(person.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!canSave} size="lg">
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              {fileToDelete !== null
                ? 'Are you sure you want to delete this document? This action cannot be undone.'
                : 'Are you sure you want to remove this person from the insurance plan? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setFileToDelete(null);
                setPersonToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={fileToDelete !== null ? confirmDeleteFile : confirmDeletePerson}
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

