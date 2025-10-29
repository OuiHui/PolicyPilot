import { useState } from 'react';
import { Upload, FileText, Lock, CheckCircle, ArrowRight, ArrowLeft, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { ProgressBar } from './ProgressBar';

type PolicyUploadProps = {
  onComplete: (policyType: 'comprehensive' | 'supplementary', files: File[]) => void;
  onBack: () => void;
};

export function PolicyUpload({ onComplete, onBack }: PolicyUploadProps) {
  const [policyType, setPolicyType] = useState<'comprehensive' | 'supplementary' | null>(null);
  const [comprehensiveFile, setComprehensiveFile] = useState<File | null>(null);
  const [sobFiles, setSobFiles] = useState<File[]>([]);
  const [eobFiles, setEobFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>> | React.Dispatch<React.SetStateAction<File[]>>,
    multiple: boolean
  ) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    if (multiple) {
      const pdfFiles = Array.from(selectedFiles).filter(file => file.type === 'application/pdf');
      (setter as React.Dispatch<React.SetStateAction<File[]>>)(prev => [...prev, ...pdfFiles]);
    } else {
      const file = selectedFiles[0];
      if (file && file.type === 'application/pdf') {
        (setter as React.Dispatch<React.SetStateAction<File | null>>)(file);
      }
    }
  };

  const handleSubmit = () => {
    if (!policyType) return;
    
    setIsProcessing(true);
    const allFiles = policyType === 'comprehensive' 
      ? comprehensiveFile ? [comprehensiveFile] : []
      : [...sobFiles, ...eobFiles, ...otherFiles];
    
    onComplete(policyType, allFiles);
  };

  const canSubmit = policyType === 'comprehensive' 
    ? comprehensiveFile !== null
    : sobFiles.length > 0 || eobFiles.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar currentStep={1} />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Upload Your Policy Documents</h1>
          <p className="text-gray-600">
            Select the type of policy documents you have available.
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-gray-900 mb-4">Document Type Selection</h2>
          <RadioGroup
            value={policyType || ''}
            onValueChange={(value) => setPolicyType(value as 'comprehensive' | 'supplementary')}
          >
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioGroupItem value="comprehensive" id="comprehensive" className="mt-1" />
                <Label htmlFor="comprehensive" className="cursor-pointer flex-1">
                  <span className="text-gray-900 block mb-1">
                    I have my comprehensive policy document
                  </span>
                  <span className="text-gray-600">
                    The complete, detailed policy from your insurer (also called the Plan Document or Certificate of Coverage).
                  </span>
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <RadioGroupItem value="supplementary" id="supplementary" className="mt-1" />
                <Label htmlFor="supplementary" className="cursor-pointer flex-1">
                  <span className="text-gray-900 block mb-1">
                    I have multiple supplementary documents
                  </span>
                  <span className="text-gray-600">
                    Such as Summary of Benefits (SOB) and Explanation of Benefits (EOB)
                  </span>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </Card>

        {policyType === 'comprehensive' && (
          <Card className="p-6 mb-6">
            <h2 className="text-gray-900 mb-4">Comprehensive Policy Document</h2>
            <label className="block">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileSelect(e, setComprehensiveFile, false)}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                {comprehensiveFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-gray-900">{comprehensiveFile.name}</p>
                      <p className="text-gray-500">{(comprehensiveFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setComprehensiveFile(null);
                      }}
                      className="ml-4 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-900 mb-1">Upload comprehensive policy document</p>
                    <p className="text-gray-500">Click to browse</p>
                  </>
                )}
              </div>
            </label>
          </Card>
        )}

        {policyType === 'supplementary' && (
          <div className="space-y-6 mb-6">
            <Card className="p-6">
              <h2 className="text-gray-900 mb-4">Summary of Benefits (SOB)</h2>
              <label className="block">
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={(e) => handleFileSelect(e, setSobFiles, true)}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-900">Upload SOB documents</p>
                  <p className="text-gray-500">Multiple PDFs accepted</p>
                </div>
              </label>
              {sobFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {sobFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-gray-900">{file.name}</span>
                      <button onClick={() => setSobFiles(sobFiles.filter((_, i) => i !== index))}>
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-gray-900 mb-4">Explanation of Benefits (EOB)</h2>
              <label className="block">
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={(e) => handleFileSelect(e, setEobFiles, true)}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-900">Upload EOB documents</p>
                  <p className="text-gray-500">Multiple PDFs accepted</p>
                </div>
              </label>
              {eobFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {eobFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-gray-900">{file.name}</span>
                      <button onClick={() => setEobFiles(eobFiles.filter((_, i) => i !== index))}>
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-gray-900 mb-4">Other Supplementary Documents</h2>
              <label className="block">
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={(e) => handleFileSelect(e, setOtherFiles, true)}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-900">Upload other documents</p>
                  <p className="text-gray-500">Multiple PDFs accepted - Optional</p>
                </div>
              </label>
              {otherFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {otherFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-gray-900">{file.name}</span>
                      <button onClick={() => setOtherFiles(otherFiles.filter((_, i) => i !== index))}>
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
          <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-900">
            All files are encrypted and HIPAA compliant. Your documents are processed securely.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} size="lg">
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isProcessing}
            size="lg"
            className="px-8"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Documents...
              </>
            ) : (
              <>
                Finish Upload & Analyze
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
