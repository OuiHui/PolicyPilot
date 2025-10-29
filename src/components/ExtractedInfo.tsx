import { useState } from 'react';
import { ArrowRight, ArrowLeft, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ProgressBar } from './ProgressBar';
import type { ParsedData } from '../App';

type ExtractedInfoProps = {
  data: ParsedData;
  onSave: (data: ParsedData) => void;
  onBack: () => void;
};

export function ExtractedInfo({ data, onSave, onBack }: ExtractedInfoProps) {
  const [insurer, setInsurer] = useState(data.insurer);
  const [policyNumber, setPolicyNumber] = useState(data.policyNumber);
  const [denialReason, setDenialReason] = useState(data.denialReason);

  const commonInsurers = [
    'HealthGuard Insurance Co.',
    'Blue Cross Blue Shield',
    'Aetna',
    'UnitedHealthcare',
    'Cigna',
    'Humana',
    'Kaiser Permanente',
    'Anthem',
    'Other'
  ];

  const handleSave = () => {
    onSave({
      insurer,
      policyNumber,
      denialReason
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar currentStep={2} />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Review Extracted Information</h1>
          <p className="text-gray-600">
            We've extracted key information from your documents. Please review and edit as needed.
          </p>
        </div>

        <Card className="p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Edit className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900">Editable Fields</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">
                Insurance Company *
              </label>
              <Select value={insurer} onValueChange={setInsurer}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select insurance company" />
                </SelectTrigger>
                <SelectContent>
                  {commonInsurers.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-gray-500 mt-1">
                Select from common insurers or choose "Other" to enter manually
              </p>
            </div>

            {insurer === 'Other' && (
              <div>
                <label className="block text-gray-700 mb-2">
                  Custom Insurance Company Name
                </label>
                <Input
                  value={insurer}
                  onChange={(e) => setInsurer(e.target.value)}
                  placeholder="Enter insurance company name"
                  className="w-full"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-2">
                Policy Number *
              </label>
              <Input
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                placeholder="e.g., HG-2024-789456"
                className="w-full"
              />
              <p className="text-gray-500 mt-1">
                Usually found on your insurance card or policy documents
              </p>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Denial Reason *
              </label>
              <Textarea
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                placeholder="Brief description of why your claim was denied"
                className="w-full min-h-[120px]"
              />
              <p className="text-gray-500 mt-1">
                This should match the reason stated in your denial letter
              </p>
            </div>
          </div>
        </Card>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-8">
          <p className="text-blue-900">
            <strong>Why edit?</strong> Accurate information helps us build a stronger appeal strategy. 
            If our AI misread any details, you can correct them here.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} size="lg">
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </Button>
          <Button
            onClick={handleSave}
            disabled={!insurer || !policyNumber || !denialReason}
            size="lg"
            className="px-8"
          >
            Save & Continue to Analysis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
