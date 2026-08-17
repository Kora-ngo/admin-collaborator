import { Button } from "../../../components/ui/button";
import CountrySelect from "../../../components/widgets/country-select";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import PhoneInput from "../../../components/widgets/phone-input";
import { useAuthStore } from "../store/authStore";
import RegionSelect from "../../../components/widgets/region-select";
// import { Textarea } from "../../../components/widgets/textarea";
// import { useAdminResgister } from "../hooks/useAdminResgister";

interface RegisterOrgProps {
  orgForm: any;
  orgErrors: any;
  handleOrgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onBack: () => void;
}


const RegsiterOrg: React.FC<RegisterOrgProps> = ({ orgForm, orgErrors, handleOrgChange, onNext, onBack })=> {

    const loading = useAuthStore((state) => state.loading);



    return ( 
        <div className="flex flex-col justify-between p-6 md:p-10 bg-background">
            <div className="max-w-2xl w-full mx-auto">
                <h3 className="text-3xl font-bold mb-4">Organisation Details</h3>
                <p className="text-gray-400 mb-8">
                    <b>Tell us about your organization.</b> These details will help us set up your Kora workspace, appear in reports, and allow your team to identify the organization they are working under.
                </p>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Organisation Name */}
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="name">Organisation Name</Label>
                        <Input
                            id="name"
                            maxLength={50}
                            name="name"
                            type="text"
                            placeholder="E.g NGO Solutions Ltd"
                            hasError={orgErrors.name}
                            value={orgForm.name}
                            onChange={handleOrgChange}
                        />
                        {orgErrors.name && <p className="text-destructive text-sm font-bold">This field is required</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Organisation's Email</Label>
                        <Input
                            id="email"
                            maxLength={50}
                            name="email"
                            type="text"
                            placeholder="organisation@example.org"
                            hasError={orgErrors.email}
                            value={orgForm.email}
                            onChange={handleOrgChange}
                        />
                        {orgErrors.email && <p className="text-destructive text-sm font-bold">This field is required</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone" required={false}>Organisation's Phone</Label>
                        <PhoneInput
                            value={orgForm.phone}
                            hasError={!!orgErrors.phone}
                            defaultCountryCode="CM"
                            onChange={(fullPhone) =>
                            handleOrgChange({
                                target: { name: "phone", value: fullPhone },
                            } as React.ChangeEvent<HTMLInputElement>)
                            }
                        />
                    </div>
                    

                    <div className="grid gap-2">
                        <Label htmlFor="country">Country</Label>
                        <CountrySelect
                            value={orgForm.country}
                            hasError={!!orgErrors.country}
                            onChange={(countryName) =>
                            handleOrgChange({
                                target: { name: "country", value: countryName },
                            } as React.ChangeEvent<HTMLInputElement>)
                            }
                        />
                        {orgErrors.country && <p className="text-destructive text-sm font-bold">This field is required</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="region">Region</Label>
                        <RegionSelect
                            country={orgForm.country}
                            value={orgForm.region}
                            hasError={!!orgErrors.region}
                            onChange={(regionCode) =>
                                handleOrgChange({
                                    target: { name: "region", value: regionCode },
                                } as React.ChangeEvent<HTMLInputElement>)
                            }
                        />
                        {orgErrors.region && <p className="text-destructive text-sm font-bold">This field is required</p>}
                    </div>
{/* 
                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="description" required={false}>Organisation Description</Label>
                        <Textarea
                        id="description"
                        name="description"
                        className=""
                        placeholder="Describe what your organisation is all about"
                        rows={2}
                        value={orgForm.description}
                        onChange={handleOrgChange}
                        />
                    </div> */}
                </form> 
            </div>
            
            {/* Next Button - Pushed to the bottom of the right column */}
            <div className="max-w-2xl w-full mx-auto mt-12">
                <div className="flex justify-between">
                    <Button  variant="ghost" onClick={(e: any) => {e.preventDefault(); onBack();}}>
                        Previous
                    </Button>
                    <Button  onClick={onNext} loading={loading}>
                        Register
                    </Button>
                </div>
            </div>
        </div>
     );
}
 
export default RegsiterOrg;