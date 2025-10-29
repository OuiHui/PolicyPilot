import { useState } from 'react';
import { Upload, FileText, Lock, CheckCircle, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ProgressBar } from './ProgressBar';

type DenialUploadProps = {
  onContinue: (files: File[]) => void;
  onBack: () => void;
};

export function DenialUpload({ onContinue, onBack }: DenialUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    setFiles([...files, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const pdfFiles = Array.from(selectedFiles).filter(
        file => file.type === 'application/pdf'
      );
      setFiles([...files, ...pdfFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar currentStep={1} />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Upload Your Denial Documents</h1>
          <p className="text-gray-600">
            Upload the formal denial letter from your insurer or any related hospital bills.
          </p>
        </div>

        <Card className="p-6 mb-6">
          <label className="block mb-4">
            <span className="text-gray-900">Denial Letter or Hospital Bill(s)</span>
            <span className="text-gray-500 ml-2">Multiple PDFs accepted</span>
          </label>
          
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer
              ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            `}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 mb-2">
              Drop denial letter/bills here or click to browse
            </p>
            <p className="text-gray-500 mb-4">Multiple PDFs accepted</p>
            <label className="inline-block">
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors inline-block">
                Choose Files
              </span>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <p className="text-gray-700 mb-3">{files.length} file(s) uploaded:</p>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-gray-900">{file.name}</p>
                        <p className="text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="p-1 hover:bg-green-100 rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
          <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-900">
              All files are encrypted and HIPAA compliant.
            </p>
            <p className="text-green-700 mt-1">
              Your documents are processed securely and never shared with third parties.
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} size="lg">
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </Button>
          <Button
            onClick={() => onContinue(files)}
            disabled={files.length === 0}
            size="lg"
            className="px-8"
          >
            Continue to Policy Documents
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
