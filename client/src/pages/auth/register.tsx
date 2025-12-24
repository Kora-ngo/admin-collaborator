import { useState } from 'react';
import ResgiterUser from '../../features/auth/components/register-user';
import RegsiterOrg from '../../features/auth/components/register-org';
import logo from "../../assets/logo.svg";
import ResgisterSub from '../../features/auth/components/resgister-sub';

const Resgister = () => {
const [activeStep] = useState(1); // You can change this to navigate steps

  return (
<div className="grid min-h-screen lg:grid-cols-[400px_1fr]">
      {/* Left Sidebar - Progress Steps */}
      <div className="flex bg-accent/10 relative lg:block w-full h-full place-items-center-safe place-content-center-safe">
        <div className="w-full max-w-sm p-8 lg:p-12">
          {/* Logo */}
          <div className="mb-2">
            <div className="flex py-4 items-center">
                <img src={logo} className="size-14" />
                <span className="ms-3 font-semibold text-4xl text-primary">Kora</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-20">Create account</h2>

          {/* Progress Steps */}
          <div className="relative space-y-8">
            {/* Connecting line */}
            <div className="absolute left-5 top-16 bottom-8 w-0.5  hidden lg:block" />

            {[
              { step: 1, label: 'Personal Details', active: true, completed: true },
              { step: 2, label: 'Organisation Details', active: false, completed: false },
            //   { step: 3, label: 'Subscription Details', active: false, completed: false },
            //   { step: 4, label: 'Summary', active: false, completed: false },
            //   { step: 5, label: 'Receipt', active: false, completed: false },
            ].map((item) => (
              <div key={item.step} className="flex items-center space-x-4 relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold z-10 transition-colors ${
                    item.completed || item.active
                      ? 'bg-accent text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {item.completed ? '✓' : item.step}
                </div>
                <span
                  className={`text-lg ${
                    item.active ? 'text-accent font-semibold' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Content - Form Area */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-background">
            <ResgiterUser />
            {/* <RegsiterOrg /> */}
      </div>
    </div>
  );
};
 
export default Resgister;