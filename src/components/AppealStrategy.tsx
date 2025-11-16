import { useState } from 'react';
import { Lightbulb, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ProgressBar } from './ProgressBar';
import type { ParsedData } from '../App';

type AppealStrategyProps = {
  parsedData: ParsedData;
  onDraftEmail: (draft: { subject: string; body: string }) => void;
  onBack: () => void;
};

type HighlightedTerm = {
  term: string;
  definition: string;
  position: { top: number; left: number };
};

export function AppealStrategy({ parsedData, onDraftEmail, onBack }: AppealStrategyProps) {
  const [hoveredTerm, setHoveredTerm] = useState<HighlightedTerm | null>(null);

  const conflictingSections = [
    {
      section: 'Section 4.B',
      title: 'Definition of Medically Necessary Services',
      conflict: 'Your policy states that services must be appropriate and consistent with the diagnosis. The denial contradicts this provision.',
      policyText: 'Medically necessary services include those procedures that are appropriate and consistent with the diagnosis and that could not have been omitted without adversely affecting the patient\'s condition or the quality of medical care rendered.',
      highlights: [
        { term: 'medically necessary', definition: 'A service that is appropriate and consistent with your diagnosis, and cannot be omitted without negatively affecting your health.' },
        { term: 'appropriate and consistent with the diagnosis', definition: 'The service matches what is typically needed for your medical condition and aligns with standard medical practice.' }
      ]
    },
    {
      section: 'Section 7.A',
      title: 'Coverage for Physician-Recommended Treatments',
      conflict: 'Your policy covers treatments recommended by licensed physicians. Your doctor explicitly recommended this service.',
      policyText: 'The Plan shall provide coverage for all medically necessary services that are ordered or recommended by a licensed, treating physician.',
      highlights: [
        { term: 'licensed, treating physician', definition: 'A doctor who is legally authorized to practice medicine and is actively involved in your care.' }
      ]
    }
  ];

  const handleTextClick = (term: string, definition: string, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setHoveredTerm({
      term,
      definition,
      position: { top: rect.top, left: rect.right + 10 }
    });
  };

  const renderHighlightedText = (text: string, highlights: { term: string; definition: string }[]) => {
    let result = text;
    const parts: { text: string; isHighlight: boolean; term?: string; definition?: string }[] = [];
    let lastIndex = 0;

    highlights.forEach(({ term, definition }) => {
      const index = result.toLowerCase().indexOf(term.toLowerCase(), lastIndex);
      if (index !== -1) {
        if (index > lastIndex) {
          parts.push({ text: result.substring(lastIndex, index), isHighlight: false });
        }
        parts.push({ 
          text: result.substring(index, index + term.length), 
          isHighlight: true,
          term,
          definition 
        });
        lastIndex = index + term.length;
      }
    });

    if (lastIndex < result.length) {
      parts.push({ text: result.substring(lastIndex), isHighlight: false });
    }

    return (
      <>
        {parts.map((part, index) => 
          part.isHighlight ? (
            <span
              key={index}
              className="bg-yellow-200 px-1 rounded cursor-help hover:bg-yellow-300 transition-colors"
              onClick={(e) => handleTextClick(part.term!, part.definition!, e)}
              onMouseEnter={(e) => handleTextClick(part.term!, part.definition!, e)}
              onMouseLeave={() => setHoveredTerm(null)}
            >
              {part.text}
            </span>
          ) : (
            <span key={index}>{part.text}</span>
          )
        )}
      </>
    );
  };

  const handleDraft = () => {
    onDraftEmail({
      subject: `Appeal for Claim Denial - Policy #${parsedData.policyNumber}`,
      body: `Dear ${parsedData.insurer} Claims Department,

I am writing to formally appeal the denial of my recent claim under Policy #${parsedData.policyNumber}.

According to your denial notice, the claim was denied on the basis that the service was "${parsedData.denialReason.toLowerCase()}." Upon review, this determination appears inconsistent with the terms and coverage provisions outlined in my policy.

Specifically, Section 4.B of the policy states: "Medically necessary services include those procedures that are appropriate and consistent with the diagnosis and that could not have been omitted without adversely affecting the patient's condition or the quality of care provided."

My treating physician has confirmed that this service was medically necessary, appropriate for my diagnosis, and consistent with accepted standards of medical care. The procedure was performed based on sound clinical judgment and was essential for effective treatment and recovery.

Accordingly, I respectfully request that you:
1. Review the enclosed medical documentation and physician statement,
2. Reconsider the claim in light of the policy language cited above, and
3. Provide a written explanation if the denial is upheld, including the specific basis for your determination.

Please confirm receipt of this appeal and advise if any additional information is needed to facilitate review. I look forward to your response within the timeframe specified in my policy’s appeal procedures.

Sincerely,
[Your Name]`
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
      <ProgressBar currentStep={2} steps={progressSteps} />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Your Appeal Strategy Analysis</h1>
          <p className="text-gray-600">
            We've identified key conflicts between the denial and your policy provisions.
          </p>
        </div>

        <div className="space-y-6">
          {/* Denial Analysis */}
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-gray-900">Denial Analysis</h2>
            </div>
            <div className="pl-13">
              <p className="text-gray-700 mb-4">
                Your insurance company, {parsedData.insurer}, denied your claim stating that the service 
                was "{parsedData.denialReason.toLowerCase()}." This determination appears to conflict with several 
                provisions in your policy document.
              </p>
              <p className="text-gray-700 mb-4">
                Your policy explicitly defines coverage criteria that should apply to your situation. 
                Since your doctor ordered this treatment and documented its necessity, the denial 
                appears to violate the terms of your policy.
              </p>
              <p className="text-gray-700">
                <strong>The Issue:</strong> They're applying a stricter definition than what's written 
                in your policy. This is a strong basis for appeal.
              </p>
            </div>
          </Card>

          {/* Policy Analysis & Key Terms */}
          <Card className="p-6 relative">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-gray-900 mb-2">Policy Analysis & Key Terms</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>Hover over highlighted terms for explanations</span>
                </div>
              </div>
            </div>
            <div className="pl-13 space-y-4">
              {conflictingSections.map((item) => (
                <div key={item.section} className="border-l-4 border-orange-500 pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge variant="outline" className="mb-2">{item.section}</Badge>
                      <h3 className="text-gray-900">{item.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">
                    <strong>The Conflict:</strong> {item.conflict}
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 italic leading-relaxed">
                      "{renderHighlightedText(item.policyText, item.highlights)}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Hover Tooltip */}
          {hoveredTerm && (
            <div
              className="fixed z-50 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 max-w-xs"
              style={{
                top: `${hoveredTerm.position.top}px`,
                left: `${hoveredTerm.position.left}px`,
              }}
            >
              <p className="text-blue-600 mb-1">{hoveredTerm.term}</p>
              <p className="text-gray-700">{hoveredTerm.definition}</p>
            </div>
          )}

          {/* Recommendation */}
          <Card className="p-6 border-2 border-green-500 bg-green-50">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-gray-900 mb-2">Our Recommendation</h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg mb-4">
                  <span>Case Correction</span>
                </div>
                <p className="text-gray-700 mb-4">
                  Based on our analysis, we recommend proceeding with a case correction request. 
                  The conflicts we've identified give you a strong basis for overturning this denial.
                </p>
                <p className="text-gray-700">
                  <strong>Why this approach:</strong> The denial appears to violate explicit terms in your 
                  policy. A clear, well-documented correction request citing these specific sections has a 
                  high likelihood of success.
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack} size="lg">
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back
            </Button>
            <Button onClick={handleDraft} size="lg" className="px-8">
              Draft Initial Email
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
