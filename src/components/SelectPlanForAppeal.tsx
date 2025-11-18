import { useState } from 'react';
import { FileText, ArrowLeft, ArrowRight, Users, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ProgressBar } from './ProgressBar';
import type { InsurancePlan } from './InsurancePlans';

type SelectPlanForAppealProps = {
  plans: InsurancePlan[];
  onContinue: (planId: string, coveredPersonId: string) => void;
  onCancel: () => void;
  onAddPlan: () => void;
};

export function SelectPlanForAppeal({ plans, onContinue, onCancel, onAddPlan }: SelectPlanForAppealProps) {
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState('');

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const canProceed = selectedPlanId && selectedPersonId;

  const progressSteps = [
    "Choose Plan",
    "Upload Documents",
    "Strategy",
    "Send",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {plans.length > 0 && <ProgressBar currentStep={0} steps={progressSteps} />}
      
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl text-gray-900">Start New Appeal Case</h1>
              <p className="text-gray-600">Select your insurance plan and who this appeal is for</p>
            </div>
          </div>
        </div>

        {plans.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl text-gray-900 mb-2">
              No Insurance Plans Found
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Before creating an appeal case, you need to add your insurance plan information. This only needs to be done once.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={onAddPlan}>
                Add Insurance Plan
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <div className="space-y-6">
              {/* Step 1: Select Insurance Plan */}
              <div>
                <Label htmlFor="insurance-plan">Select Insurance Plan *</Label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger id="insurance-plan" className="mt-2">
                    <SelectValue placeholder="Choose the plan that covers this medical service" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{plan.planName} - {plan.insuranceCompany}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-gray-500 mt-2">
                  Choose the plan that covers this medical service
                </p>
                {plans.length > 0 && (
                  <button
                    onClick={onAddPlan}
                    className="text-blue-600 hover:text-blue-700 mt-2 text-sm"
                  >
                    + Add a different plan
                  </button>
                )}
              </div>

              {/* Step 2: Select Covered Person */}
              {selectedPlan && (
                <div>
                  <Label htmlFor="covered-person">Who is this appeal for? *</Label>
                  <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                    <SelectTrigger id="covered-person" className="mt-2">
                      <SelectValue placeholder="Select the person who received the denied service" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedPlan.coveredIndividuals.map(person => (
                        <SelectItem key={person.id} value={person.id}>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{person.name} ({person.relationship})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-gray-500 mt-2">
                    Select the person who received the denied service
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={onCancel}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              
              <Button
                onClick={() => onContinue(selectedPlanId, selectedPersonId)}
                disabled={!canProceed}
              >
                Continue to Document Upload
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

