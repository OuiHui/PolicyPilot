import { useState } from "react";
import { ArrowRight, ArrowLeft, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ProgressBar } from "./ProgressBar";

export type InsurancePlanParsedData = {
  insuranceCompany: string;
  planName: string;
  policyNumber: string;
  groupNumber?: string;
};

type InsurancePlanExtractedInfoProps = {
  data: InsurancePlanParsedData;
  onSave: (data: InsurancePlanParsedData) => void;
  onBack: () => void;
};

export function InsurancePlanExtractedInfo({
  data,
  onSave,
  onBack,
}: InsurancePlanExtractedInfoProps) {
  const commonInsurers = [
    "UnitedHealthcare",
    "Anthem Blue Cross Blue Shield",
    "Aetna",
    "Cigna",
    "Humana",
    "Kaiser Permanente",
    "Blue Cross Blue Shield",
    "Molina Healthcare",
    "Centene",
    "Other",
  ];

  // Check if extracted company matches any common insurers
  const isCommonInsurer = commonInsurers.some(
    insurer => insurer.toLowerCase() === data.insuranceCompany.toLowerCase() || 
    (insurer !== "Other" && data.insuranceCompany.toLowerCase().includes(insurer.toLowerCase()))
  );

  const matchedInsurer = commonInsurers.find(
    insurer => insurer.toLowerCase() === data.insuranceCompany.toLowerCase() ||
    (insurer !== "Other" && data.insuranceCompany.toLowerCase().includes(insurer.toLowerCase()))
  );

  const [insuranceCompany, setInsuranceCompany] = useState(
    matchedInsurer || "Other"
  );
  const [customInsurer, setCustomInsurer] = useState(
    matchedInsurer ? "" : data.insuranceCompany
  );
  const [planName, setPlanName] = useState(data.planName);
  const [policyNumber, setPolicyNumber] = useState(data.policyNumber);
  const [groupNumber, setGroupNumber] = useState(data.groupNumber || "");

  const handleSave = () => {
    onSave({
      insuranceCompany:
        insuranceCompany === "Other" ? customInsurer : insuranceCompany,
      planName,
      policyNumber,
      groupNumber: groupNumber || undefined,
    });
  };

  const progressSteps = [
    "Upload Documents",
    "Add Individuals",
    "Confirm",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar currentStep={0} steps={progressSteps} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">
            Review Extracted Insurance Plan Information
          </h1>
          <p className="text-gray-600">
            We've extracted information from your policy. Review and edit as needed.
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
              <Select
                value={insuranceCompany}
                onValueChange={setInsuranceCompany}
              >
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

            {insuranceCompany === "Other" && (
              <div>
                <label className="block text-gray-700 mb-2">
                  Custom Insurance Company Name
                </label>
                <Input
                  value={customInsurer}
                  onChange={(e) => setCustomInsurer(e.target.value)}
                  placeholder="Enter insurance company name"
                  className="w-full"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-2">
                Plan Name *
              </label>
              <Input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g., PPO Gold 2024"
                className="w-full"
              />
              <p className="text-gray-500 mt-1">
                Give your plan a memorable name for easy reference
              </p>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Policy Number *
              </label>
              <Input
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                placeholder="e.g., ABC123456789"
                className="w-full"
              />
              <p className="text-gray-500 mt-1">
                Usually found on your insurance card or policy documents
              </p>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Group Number (Optional)
              </label>
              <Input
                value={groupNumber}
                onChange={(e) => setGroupNumber(e.target.value)}
                placeholder="e.g., GRP987654"
                className="w-full"
              />
              <p className="text-gray-500 mt-1">
                If your insurance is through an employer, you may have a group number
              </p>
            </div>
          </div>
        </Card>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-8">
          <p className="text-blue-900">
            <strong>Why edit?</strong> Accurate information helps us build
            stronger appeals. If our AI misread any details, you can
            correct them here.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} size="lg">
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !insuranceCompany ||
              (insuranceCompany === "Other" && !customInsurer) ||
              !planName ||
              !policyNumber
            }
            size="lg"
            className="px-8"
          >
            Save & Continue
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

