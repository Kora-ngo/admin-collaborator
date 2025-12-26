import { useState } from 'react';
import logo from "../../assets/logo.svg";
import RegisterUser from '../../features/auth/components/register-user';
import RegisterOrg from '../../features/auth/components/register-org';
import { useAdminResgister } from '../../features/auth/hooks/useAdminResgister'; // Adjust path
import Toast from '../../components/widgets/toast';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { step: 1, label: 'Personal Details' },
    { step: 2, label: 'Organisation Details' },
  ];

  // Move the hook here — single source of truth
  const {
    userForm,
    errors,
    handleChange,
    handleUserData,

    orgForm,
    orgErrors,
    handleOrgChange,
    handleOrgData,
  } = useAdminResgister();

  const handleNext = () => {
    if (currentStep === 1) {
      const isValid = handleUserData();
      if (!isValid) return;
    } else if (currentStep === 2) {
      const isValid = handleOrgData();
      if (!isValid) return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepCompleted = (step: number) => step < currentStep;
  const isStepActive = (step: number) => step === currentStep;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-[400px] lg:flex lg:bg-accent/10 lg:overflow-y-auto">
        <div className="w-full max-w-sm mx-auto p-8 lg:p-12">
          <div className="mb-2">
            <div className="flex items-center py-4">
              <img src={logo} alt="Kora" className="size-12" />
              <span className="ml-3 font-semibold text-3xl text-primary">Kora</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-16">Create account</h2>

          <div className="relative space-y-8">
            <div className="absolute left-5 top-16 bottom-8 w-0.5 bg-gray-300" />
            {steps.map((item) => (
              <div key={item.step} className="flex items-center space-x-4 relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold z-10 transition-colors ${
                    isStepCompleted(item.step) || isStepActive(item.step)
                      ? 'bg-accent text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isStepCompleted(item.step) ? '✓' : item.step}
                </div>
                <span className={`text-lg ${isStepActive(item.step) ? 'text-accent font-semibold' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-[400px]">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
          <div className="p-4">
            <div className="flex items-center justify-center gap-4">
              <img src={logo} alt="Kora" className="size-10" />
              <span className="font-semibold text-2xl text-primary">Kora</span>
            </div>
            <p className="text-center text-sm text-gray-600 mt-3">
              Create account • Step {currentStep} of {steps.length}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="pt-24 lg:pt-0 min-h-screen p-6 md:p-10">
          <div className="max-w-2xl w-full mx-auto">
            {currentStep === 1 && (
              <RegisterUser
                userForm={userForm}
                errors={errors}
                handleChange={handleChange}
                onNext={handleNext}
              />
            )}
            {currentStep === 2 && (
              <RegisterOrg
                orgForm={orgForm}
                orgErrors={orgErrors}
                handleOrgChange={handleOrgChange}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;