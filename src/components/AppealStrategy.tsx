import { useState, useEffect } from 'react';
import { Lightbulb, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ProgressBar } from './ProgressBar';
import type { ParsedData } from '../App';
import { apiUrl } from '../config';

type AppealStrategyProps = {
  caseId: string;
  userId: string;
  parsedData: ParsedData;
  onDraftEmail: (draft: { subject: string; body: string }) => void;
  onBack: () => void;
};

type HighlightedTerm = {
  term: string;
  definition: string;
  position: { top: number; left: number };
};

type RAGAnalysisResult = {
  analysis: string;
  terms: { term: string; definition: string }[];
  emailDraft: { subject: string; body: string };
  contextUsed: string[];
};

export function AppealStrategy({ caseId, userId, parsedData, onDraftEmail, onBack }: AppealStrategyProps) {
  const [hoveredTerm, setHoveredTerm] = useState<HighlightedTerm | null>(null);
  const [analysisResult, setAnalysisResult] = useState<RAGAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(apiUrl(`/api/cases/${caseId}/analyze?userId=${userId}`), {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to analyze case');
        }

        const data = await response.json();
        setAnalysisResult(data);
      } catch (err) {
        console.error("Error analyzing case:", err);
        setError("Failed to generate analysis. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [caseId, userId]);

  const handleTextClick = (term: string, definition: string, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setHoveredTerm({
      term,
      definition,
      position: { top: rect.top, left: rect.right + 10 }
    });
  };

  const renderHighlightedText = (text: string, highlights: { term: string; definition: string }[]) => {
    if (!highlights || highlights.length === 0) return <span>{text}</span>;

    let result = text;
    const parts: { text: string; isHighlight: boolean; term?: string; definition?: string }[] = [];
    let lastIndex = 0;

    // Sort highlights by occurrence in text to avoid overlap issues (simple approach)
    // For RAG output, we might not have exact text match if the model paraphrased.
    // This highlighting logic assumes 'text' is the raw context and 'highlights' are terms found in it.
    // However, the RAG output gives us 'analysis' text and 'terms'. The terms might be in the analysis or the context.
    // Let's try to highlight terms within the analysis text.
    
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
    if (analysisResult?.emailDraft) {
      onDraftEmail(analysisResult.emailDraft);
    } else {
        // Fallback
        onDraftEmail({
            subject: `Appeal for Claim Denial - Policy #${parsedData.policyNumber}`,
            body: "Error generating draft."
        });
    }
  };

  const progressSteps = [
    "Choose Plan",
    "Upload Documents",
    "Strategy",
    "Send",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Analyzing your case...</h2>
        <p className="text-gray-600 mt-2">Our AI is reviewing your policy and denial letter.</p>
      </div>
    );
  }

  if (error || !analysisResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Analysis Failed</h2>
        <p className="text-gray-600 mt-2 mb-6">{error || "Something went wrong."}</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar currentStep={2} steps={progressSteps} />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Your Appeal Strategy Analysis</h1>
          <p className="text-gray-600">
            We've analyzed your documents and identified key points for your appeal.
          </p>
        </div>

        <div className="space-y-6">
          {/* Denial Analysis */}
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-gray-900">AI Analysis</h2>
            </div>
            <div className="pl-13">
              <div className="text-gray-700 mb-4 whitespace-pre-wrap">
                {renderHighlightedText(analysisResult.analysis, analysisResult.terms)}
              </div>
            </div>
          </Card>

          {/* Key Terms */}
          {analysisResult.terms.length > 0 && (
            <Card className="p-6 relative">
                <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                    <h2 className="text-gray-900 mb-2">Key Terms Explained</h2>
                    <div className="flex items-center gap-2 text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    <span>Hover over highlighted terms in the analysis above or review below</span>
                    </div>
                </div>
                </div>
                <div className="pl-13 space-y-4">
                    {analysisResult.terms.map((term, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-semibold text-gray-900">{term.term}:</span>
                            <span className="text-gray-700 ml-2">{term.definition}</span>
                        </div>
                    ))}
                </div>
            </Card>
          )}

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
                  <span>Proceed with Appeal</span>
                </div>
                <p className="text-gray-700 mb-4">
                  Based on the AI analysis, we have drafted a professional appeal letter for you.
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
              Review Email Draft
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
