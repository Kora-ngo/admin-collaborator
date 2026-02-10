import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";


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
              Provide your personal information to securely create your admin account.
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
              <div className="grid gap-2">
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
              </div>

              {/* Contact Details - Phone */}
              <div className="grid gap-2">
                <Label htmlFor="phone">Contact Details</Label>
                <div className="flex items-center gap-3">
                  {/* Main Phone Input - Takes remaining space */}
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Your phone number"
                    // prefixElement={<label className="text-primary">(+237) |</label>}
                    value={userForm.phone}
                    hasError={errors.phone}
                    onChange={handleChange}

                  />
                </div>
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