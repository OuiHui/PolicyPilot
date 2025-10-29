import { Check } from 'lucide-react';

type Step = {
  number: number;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
};

type ProgressBarProps = {
  currentStep: number;
};

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const steps: Step[] = [
    {
      number: 1,
      title: 'Upload Documents',
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming'
    },
    {
      number: 2,
      title: 'Strategy',
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming'
    },
    {
      number: 3,
      title: 'Send & Monitor',
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'current' : 'upcoming'
    }
  ];

  return (
    <div className="w-full bg-white border-b border-gray-200 px-8 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${step.status === 'completed' ? 'bg-green-600 text-white' : ''}
                    ${step.status === 'current' ? 'bg-blue-600 text-white' : ''}
                    ${step.status === 'upcoming' ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {step.status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p
                    className={`
                      ${step.status === 'current' ? 'text-gray-900' : 'text-gray-500'}
                    `}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className="h-0.5 bg-gray-200">
                    <div
                      className={`h-full transition-all ${
                        step.status === 'completed' ? 'bg-green-600 w-full' : 'bg-gray-200 w-0'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
