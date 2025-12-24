import { Button } from "../../../components/widgets/button";
import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";
import { Textarea } from "../../../components/widgets/textarea";

const RegsiterOrg = () => {
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
                        <Label htmlFor="org-name">Organisation Name</Label>
                        <Input
                            id="org-name"
                            maxLength={50}
                            name="org-name"
                            type="text"
                            placeholder="E.g NGO Solutions Ltd"
                        />
                    </div>
                    <div></div>

                    <div className="grid gap-2">
                        <Label htmlFor="org-name">Organisation's Email</Label>
                        <Input
                            id="org-name"
                            maxLength={50}
                            name="org-name"
                            type="text"
                            placeholder="organisation@example.org"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="org-name" required={false}>Organisation's Phone</Label>
                        <Input
                            prefix="+237"
                            id="org-name"
                            maxLength={50}
                            name="org-name"
                            type="text"
                            placeholder="XXX - XXX - XXX"
                            prefixElement={<label className="text-primary">(+237) |</label>}
                        />
                    </div>
                    

                    <div className="grid gap-2">
                        <Label htmlFor="org-name" required={false}>Country</Label>
                        <Input
                            id="org-name"
                            maxLength={50}
                            name="org-name"
                            type="text"
                            placeholder="Organisation's Country"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="org-name" required={false}>Reigon</Label>
                        <Input
                            id="org-name"
                            maxLength={50}
                            name="org-name"
                            type="text"
                            placeholder="Organisation's region /headquarter reigon"
                        />
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="org-description">Organisation Name</Label>
                        <Textarea
                        id="org-description"
                        className=""
                        placeholder="Describe what your organisation is all about"
                        rows={2}
                        />
                    </div>
                </form> 
            </div>
            
            {/* Next Button - Pushed to the bottom of the right column */}
            <div className="max-w-2xl w-full mx-auto mt-12">
                <div className="flex justify-between">
                    <Button type="button" variant="ghost">
                        Previous
                    </Button>
                    <Button type="button">
                        Next
                    </Button>
                </div>
            </div>
        </div>
     );
}
 
export default RegsiterOrg;