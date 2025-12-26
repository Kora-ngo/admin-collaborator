import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";
import { useAuthStore } from "../store/authStore";
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
                    Provide your organisation information to securely create your admin account.
                </p>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Organisation Name */}
                    <div className="grid gap-2">
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
                    </div>
                    <div></div>

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
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone" required={false}>Organisation's Phone</Label>
                        <Input
                            prefix="+237"
                            id="phone"
                            maxLength={50}
                            name="phone"
                            type="text"
                            placeholder="XXX - XXX - XXX"
                            prefixElement={<label className="text-primary">(+237) |</label>}
                            value={orgForm.phone}
                            onChange={handleOrgChange}
                        />
                    </div>
                    

                    <div className="grid gap-2">
                        <Label htmlFor="country" required={false}>Country</Label>
                        <Input
                            id="country"
                            maxLength={50}
                            name="country"
                            type="text"
                            placeholder="Organisation's Country"
                            value={orgForm.country}
                            onChange={handleOrgChange}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="region" required={false}>Region</Label>
                        <Input
                            id="region"
                            maxLength={50}
                            name="region"
                            type="text"
                            placeholder="Organisation's region /headquarter region"
                            value={orgForm.region}
                            onChange={handleOrgChange}
                        />
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