import { useState } from 'react';
import { Users, Plus, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ProgressBar } from './ProgressBar';
import type { CoveredPerson } from './InsurancePlans';

type AddInsurancePlanCoverageProps = {
  userEmail: string;
  initialCoveredIndividuals?: CoveredPerson[];
  onContinue: (coveredIndividuals: CoveredPerson[]) => void;
  onBack: () => void;
};

export function AddInsurancePlanCoverage({
  userEmail,
  initialCoveredIndividuals,
  onContinue,
  onBack,
}: AddInsurancePlanCoverageProps) {
  const [coveredIndividuals, setCoveredIndividuals] = useState<CoveredPerson[]>(
    initialCoveredIndividuals || [
      {
        id: '1',
        name: userEmail.split('@')[0],
        dateOfBirth: '',
        relationship: 'Self'
      }
    ]
  );

  const addCoveredPerson = () => {
    setCoveredIndividuals([
      ...coveredIndividuals,
      {
        id: Date.now().toString(),
        name: '',
        dateOfBirth: '',
        relationship: 'Spouse'
      }
    ]);
  };

  const updateCoveredPerson = (id: string, field: keyof CoveredPerson, value: string) => {
    setCoveredIndividuals(coveredIndividuals.map(person =>
      person.id === id ? { ...person, [field]: value } : person
    ));
  };

  const removeCoveredPerson = (id: string) => {
    setCoveredIndividuals(coveredIndividuals.filter(person => person.id !== id));
  };

  const canProceed = coveredIndividuals.every(p => p.name && p.dateOfBirth);

  const progressSteps = [
    "Upload Documents",
    "Add Individuals",
    "Confirm",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar currentStep={1} steps={progressSteps} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">
            Who is Covered Under This Plan?
          </h1>
          <p className="text-gray-600">
            Add all individuals covered by this insurance plan. You'll select from this list when creating appeals.
          </p>
        </div>

        <Card className="p-8 mb-6">
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
                          onChange={(e) => updateCoveredPerson(person.id, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Date of Birth *</Label>
                        <Input
                          type="date"
                          value={person.dateOfBirth}
                          onChange={(e) => updateCoveredPerson(person.id, 'dateOfBirth', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Relationship *</Label>
                      <Select 
                        value={person.relationship}
                        onValueChange={(value) => updateCoveredPerson(person.id, 'relationship', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Self">Self (Primary Policyholder)</SelectItem>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Child">Child</SelectItem>
                          <SelectItem value="Dependent">Dependent</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCoveredPerson(person.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            <Button 
              variant="outline" 
              className="w-full"
              onClick={addCoveredPerson}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Family Member
            </Button>
          </div>
        </Card>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-8">
          <p className="text-blue-900">
            <strong>Tip:</strong> Adding all family members now saves time when creating future appeals. You can always add more later.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} size="lg">
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </Button>
          <Button
            onClick={() => onContinue(coveredIndividuals)}
            disabled={!canProceed}
            size="lg"
            className="px-8"
          >
            Continue
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

