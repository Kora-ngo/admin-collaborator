import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";
import PhoneInput from "../../../components/widgets/phone-input";


interface RegisterUserProps {
  userForm: any;
  errors: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
}

const ResgiterUser: React.FC<RegisterUserProps> = ({ userForm,
  errors,
  handleChange,
  onNext, }) => {



    return ( 
        <div className="flex flex-col justify-between p-6 md:p-10 bg-background">
          {/* Form Content - Takes available space */}
          <div className="max-w-2xl w-full mx-auto">
            <h3 className="text-3xl font-bold mb-4">Personal Details</h3>
            <p className="text-gray-400 mb-8">
             <b>Tell us about yourself.</b> As the admin of your organization on Kora, your details will be used to manage the platform and receive important notifications.
            </p>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="grid gap-2">
                <Label htmlFor="fname">First Name</Label>
                <Input
                  id="fname"
                  maxLength={30}
                  name="fname"
                  type="text"
                  placeholder="E.g Frank"
                  value={userForm.fname}
                  hasError={errors.fname}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lname">Last Name</Label>
                <Input
                  id="lname"
                  maxLength={30}
                  name="lname"
                  type="text"
                  placeholder="E.g Junior"
                  value={userForm.lname}
                  hasError={errors.lname}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="email">Personal Email</Label>
                <Input
                  id="email"
                  maxLength={50}
                  name="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={userForm.email}
                  hasError={errors.email}
                  onChange={handleChange}
                />
                  {/* Info notice */}
                  <div className="flex items-start gap-2 mt-1 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-primary flex-shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                    <p className="text-xs text-primary/80 leading-relaxed">
                      <span className="font-semibold">This email will be used for login.</span>{" "}
                      All system notifications, password resets, and important updates will be sent to this address.
                    </p>
                  </div>
              </div>

              {/* Contact Details - Phone */}
              <div className="grid gap-2">
                <Label htmlFor="phone">Contact Details</Label>
                <PhoneInput
                  value={userForm.phone}
                  hasError={!!errors.phone}
                  onChange={(fullPhone) =>
                    handleChange({
                      target: { name: "phone", value: fullPhone },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  defaultCountryCode="CM" // Default to Cameroon
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
              {/* <div></div> */}

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  maxLength={20}
                  name="password"
                  type="password"
                  placeholder="At least 4 characters"
                  value={userForm.password}
                  hasError={errors.password}
                  onChange={handleChange}

                />
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  maxLength={20}
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={userForm.confirmPassword}
                  hasError={errors.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </form>
          </div>

          {/* Next Button - Pushed to the bottom of the right column */}
          <div className="max-w-2xl w-full mx-auto mt-12">
            <div className="flex justify-end">
                <Button onClick={onNext}>
                      Next
                </Button>
            </div>
          </div>
        </div>

     );
}
 
export default ResgiterUser;