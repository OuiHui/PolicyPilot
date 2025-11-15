import { Shield, Lock, FileCheck, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { useState } from 'react';

type HIPAAConsentProps = {
  onAccept: () => void;
};

export function HIPAAConsent({ onAccept }: HIPAAConsentProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [processingConsent, setProcessingConsent] = useState(false);

  const canProceed = termsAccepted && privacyAccepted && processingConsent;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl text-gray-900 mb-3">
            We Take Your Health Privacy Seriously
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-green-900">HIPAA Compliant Platform</span>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          {/* Personal Information Section */}
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <FileCheck className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h2 className="text-gray-900 mb-2">Personal Information We Access</h2>
                <ul className="space-y-2 text-gray-600">
                  <li>• Name, email address, and policy information</li>
                  <li>• Insurance documents and denial letters</li>
                  <li>• Medical billing information (procedure codes, dates of service)</li>
                  <li>• Correspondence with insurance companies</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Why We Need This Section */}
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h2 className="text-gray-900 mb-2">Why We Need This Information</h2>
                <ul className="space-y-2 text-gray-600">
                  <li>• To accurately analyze your policy and build evidence-based appeals</li>
                  <li>• To communicate with insurance companies on your behalf</li>
                  <li>• To track deadlines and ensure timely follow-ups</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* How We Protect It Section */}
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h2 className="text-gray-900 mb-2">How We Protect Your Information</h2>
                <ul className="space-y-2 text-gray-600">
                  <li>• End-to-end encryption for all documents and communications</li>
                  <li>• Secure servers with HIPAA-compliant hosting infrastructure</li>
                  <li>• Regular security audits and compliance monitoring</li>
                  <li>• Strict access controls and audit logging</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Consent Checkboxes */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-1"
              />
              <div>
                <span className="text-gray-900">I agree to the Terms of Service</span>
                <p className="text-gray-500 mt-1">
                  Review our terms governing the use of PolicyPilot services
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox 
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                className="mt-1"
              />
              <div>
                <span className="text-gray-900">I acknowledge the Privacy Policy and HIPAA Authorization</span>
                <p className="text-gray-500 mt-1">
                  Understand how we collect, use, and protect your health information
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox 
                checked={processingConsent}
                onCheckedChange={(checked) => setProcessingConsent(checked === true)}
                className="mt-1"
              />
              <div>
                <span className="text-gray-900">I consent to PolicyPilot accessing and processing my health information for appeal purposes</span>
                <p className="text-gray-500 mt-1">
                  Authorization for us to review and use your medical information to prepare appeals
                </p>
              </div>
            </label>
          </div>
        </Card>

        <Button 
          onClick={onAccept}
          disabled={!canProceed}
          className="w-full"
          size="lg"
        >
          I Understand & Continue
        </Button>

        <p className="text-center text-gray-500 mt-4">
          By continuing, you authorize PolicyPilot to act as your representative in insurance appeals
        </p>
      </div>
    </div>
  );
}

