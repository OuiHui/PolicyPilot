import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ProgressBar } from "./ProgressBar";
import { formatPolicyType } from "../utils/format";
import type { InsurancePlanParsedData } from "./InsurancePlanExtractedInfo";
import type { CoveredPerson } from "./InsurancePlans";

type AddInsurancePlanReviewProps = {
    planData: InsurancePlanParsedData;
    policyType: "comprehensive" | "supplementary";
    policyFiles: File[];
    coveredIndividuals: CoveredPerson[];
    fromAppealFlow?: boolean;
    onConfirm: () => void;
    onBack: () => void;
};

export function AddInsurancePlanReview({
    planData,
    policyType,
    policyFiles,
    coveredIndividuals,
    fromAppealFlow = false,
    onConfirm,
    onBack,
}: AddInsurancePlanReviewProps) {
    const progressSteps = ["Upload Documents", "Add Individuals", "Confirm"];

    return (
        <div className="min-h-screen bg-gray-50">
            <ProgressBar currentStep={2} steps={progressSteps} />

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl text-gray-900 mb-2">
                        Review & Confirm Insurance Plan
                    </h1>
                    <p className="text-gray-600">
                        Review your insurance plan information before saving.
                    </p>
                </div>

                <div className="space-y-6">
                    <Card className="p-6 bg-gray-50">
                        <h2 className="text-gray-900 mb-4">Plan Details</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Insurance Company:
                                </span>
                                <span className="text-gray-900 font-medium">
                                    {planData.insuranceCompany}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Plan Name:
                                </span>
                                <span className="text-gray-900 font-medium">
                                    {planData.planName}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Policy Number:
                                </span>
                                <span className="text-gray-900 font-medium">
                                    {planData.policyNumber}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-gray-50">
                        <h2 className="text-gray-900 mb-4">Policy Documents</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Document Type:
                                </span>
                                <span className="text-gray-900 font-medium">
                                    {formatPolicyType(policyType)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Files Uploaded:
                                </span>
                                <span className="text-gray-900 font-medium">
                                    {policyFiles.length}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 space-y-1">
                            {policyFiles.map((file, index) => (
                                <div
                                    key={index}
                                    className="text-gray-600 text-sm"
                                >
                                    • {file.name}
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6 bg-gray-50 mb-6">
                        <h2 className="text-gray-900 mb-4">
                            Covered Individuals ({coveredIndividuals.length})
                        </h2>
                        <div className="space-y-2">
                            {coveredIndividuals.map((person) => (
                                <div
                                    key={person.id}
                                    className="flex justify-between text-gray-600"
                                >
                                    <span>{person.name}</span>
                                    <span className="text-gray-900 font-medium">
                                        {person.relationship}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="p-6 bg-green-50 border border-green-200 rounded-lg mb-6">
                    <p className="text-green-900">
                        {fromAppealFlow ? (
                            <>
                                <strong>Next step:</strong> After saving this
                                plan, you'll continue to create your appeal.
                            </>
                        ) : (
                            <>
                                <strong>Next step:</strong> Your insurance plan
                                will be saved and you can use it to create
                                appeals.
                            </>
                        )}
                    </p>
                </div>

                <div className="flex justify-between">
                    <Button variant="outline" onClick={onBack} size="lg">
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        Back
                    </Button>
                    <Button onClick={onConfirm} size="lg" className="px-8">
                        Save Plan
                    </Button>
                </div>
            </div>
        </div>
    );
}
