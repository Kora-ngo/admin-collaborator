import { Input } from "../../../components/widgets/input";
import { Label } from "../../../components/widgets/label";

const ResgisterSub = () => {
    return ( 
        <div className="flex flex-col justify-between p-6 md:p-10 bg-background">
  {/* Form Content */}
  <div className="max-w-2xl w-full mx-auto">
    <h3 className="text-3xl font-bold mb-4">Subscription Details</h3>
    <p className="text-gray-400 mb-8">
      Choose your plan and billing preferences to complete your account setup.
    </p>

    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Plan Selection */}
      <div className="md:col-span-2 grid gap-4">
        <Label>Choose your plan</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Starter", "Professional", "Enterprise"].map((plan) => (
            <label
              key={plan}
              className="flex flex-col p-6 border-2 border-gray-200 rounded-xl cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-accent/5 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-lg">{plan}</span>
                <input
                  type="radio"
                  name="plan"
                  value={plan.toLowerCase()}
                  className="w-5 h-5 text-accent focus:ring-accent"
                  defaultChecked={plan === "Professional"}
                />
              </div>
              <div className="text-3xl font-bold mb-2">
                {plan === "Starter" && "$9"}
                {plan === "Professional" && "$29"}
                {plan === "Enterprise" && "$99"}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </div>
              <p className="text-sm text-gray-600">
                {plan === "Starter" && "Basic features for individuals"}
                {plan === "Professional" && "Best for growing teams"}
                {plan === "Enterprise" && "Advanced tools & support"}
              </p>
            </label>
          ))}
        </div>
      </div>

      {/* Billing Cycle */}
      <div className="grid gap-2">
        <Label htmlFor="billing">Billing Cycle</Label>
        <select
          id="billing"
          name="billing"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        >
          <option>Monthly</option>
          <option>Yearly (Save 20%)</option>
        </select>
      </div>

      {/* Coupon Code (Optional) */}
      <div className="grid gap-2">
        <Label htmlFor="coupon">Coupon Code (Optional)</Label>
        <Input
          id="coupon"
          name="coupon"
          type="text"
          placeholder="e.g. WELCOME2025"
        />
      </div>

      {/* Payment Method */}
      <div className="md:col-span-2 grid gap-4">
        <Label>Payment Method</Label>
        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center gap-3 px-6 py-4 border-2 border-gray-200 rounded-xl cursor-pointer has-[:checked]:border-accent">
            <input type="radio" name="payment" value="card" defaultChecked className="text-accent" />
            <span className="font-medium">Credit/Debit Card</span>
          </label>
          <label className="flex items-center gap-3 px-6 py-4 border-2 border-gray-200 rounded-xl cursor-pointer has-[:checked]:border-accent">
            <input type="radio" name="payment" value="paypal" className="text-accent" />
            <span className="font-medium">PayPal</span>
          </label>
          <label className="flex items-center gap-3 px-6 py-4 border-2 border-gray-200 rounded-xl cursor-pointer has-[:checked]:border-accent">
            <input type="radio" name="payment" value="mobile" className="text-accent" />
            <span className="font-medium">Mobile Money</span>
          </label>
        </div>
      </div>
    </form>
  </div>

  {/* Buttons at Bottom */}
  <div className="max-w-2xl w-full mx-auto mt-12">
    <div className="flex justify-between">
      <button
        type="button"
        className="px-10 py-4 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition"
      >
        Back
      </button>
      <button
        type="button"
        className="px-10 py-4 bg-accent text-white font-semibold rounded-full hover:bg-accent/90 transition shadow-lg"
      >
        Next
      </button>
    </div>
  </div>
</div>
     );
}
 
export default ResgisterSub;