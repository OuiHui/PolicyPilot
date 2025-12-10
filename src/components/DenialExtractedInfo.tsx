import { useState } from "react";
import { ArrowRight, ArrowLeft, FileText, Info, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { ProgressBar } from "./ProgressBar";

export type DenialParsedData = {
  briefDescription: string;
};

type DenialExtractedInfoProps = {
  data: DenialParsedData;
  insuranceCompany: string;
  policyNumber: string;
  onSave: (data: DenialParsedData) => void;
  onBack: () => void;
  onDelete?: () => void;
};

export function DenialExtractedInfo({
  data,
  insuranceCompany,
  policyNumber,
  onSave,
  onBack,
  onDelete,
}: DenialExtractedInfoProps) {
  // Hardcoded value
  const [briefDescription, setBriefDescription] = useState(
    "Vitamin D and TSH tests were denied as non-emergent and not medically necessary."
  );

  const handleSave = () => {
    onSave({
      briefDescription,
    });
  };

  const progressSteps = [
    "Choose Plan",
    "Upload Documents",
    "Strategy",
    "Send",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar currentStep={1} steps={progressSteps} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">
            Review Extracted Denial Information
          </h1>
          <p className="text-gray-600">
            We've analyzed your denial documents. Review and edit the description as needed.
          </p>
        </div>

        <Card className="p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900">Denial Description</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Brief Issue Description *
              </label>
              <Textarea
                value={briefDescription}
                onChange={(e) => setBriefDescription(e.target.value)}
                placeholder="e.g., ER visit for chest pain denied as not medically necessary"
                className="w-full min-h-[150px]"
              />
              <p className="text-gray-500 mt-1">
                This should match the reason stated in your denial letter
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6 bg-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-gray-600" />
            <h2 className="text-gray-900">Insurance Context (from your plan)</h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Insurance Company:</span>
              <span className="text-gray-900 font-medium">{insuranceCompany}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Policy Number:</span>
              <span className="text-gray-900 font-medium">{policyNumber}</span>
            </div>
          </div>
        </Card>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-8">
          <p className="text-blue-900">
            <strong>Why edit?</strong> Accurate information helps us build a
            stronger appeal strategy. If our AI misread any details, you can
            correct them here.
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} size="lg">
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back
            </Button>
            {onDelete && (
              <Button variant="destructive" onClick={onDelete} size="lg">
                <Trash2 className="mr-2 w-5 h-5" />
                Delete Case
              </Button>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={!briefDescription}
            size="lg"
            className="px-8"
          >
            Continue to Strategy Analysis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

