const Renew = () => {
    return ( 
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-start mb-6">Subscription Expired</h1>
        <div className="flex space-x-3 items-center bg-primary/10 p-4 my-5 rounded-sm">
        <div className="bg-primary w-2 h-20 rounded-xl"></div>
            <p className="text-start text-md font-medium text-gray-500 ">
                Your organization subscription has expired. Please renew to continue managing projects.
            </p>
        </div>
        {/* Your renewal form / Stripe integration here */}
        <button className="w-full py-3 bg-primary text-white rounded-lg">
          Renew Subscription
        </button>
      </div>
    </div>
     );
}
 
export default Renew;