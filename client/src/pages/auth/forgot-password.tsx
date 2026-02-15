import ForgotPasswordForm from "../../features/auth/components/forgot-password-form";


const ForgotPassword = () => {
    return ( 
            <div className="grid min-h-screen lg:grid-cols-2">
                <div className="flex bg-gray-950 relative hidden lg:block w-full h-full place-items-center-safe place-content-center-safe ">
                    <div className="flex space-x-2 items-center mb-10">
                        <img src="https://res.cloudinary.com/doqholno8/image/upload/v1771016666/white_logo_cbf8ki.png" className="size-12" />
                        <p className="text-4xl font-semibold text-white">Kora</p>
                    </div>
                    <img src="https://res.cloudinary.com/doqholno8/image/upload/v1771076469/login_hvaqbw.png" className="w-auto h-90" />
                    <div className="text-center text-gray-400 mx-24 py-6">
                        <p>Easily manage beneficiaries, projects, and distributions from a single platform. Kora keeps your programs organized, 
                            saves time in the field, and ensures transparent impact for every community served.</p>
                    </div>
                </div>
                <div className="flex flex-col gap-4 p-6 md:p-10">

                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-sm">
                            <form className="flex flex-col gap-6">
                                  <div className="flex flex-col items-start gap-2 text-start">
                                        <h1 className="text-2xl font-bold">Forgot your password ?</h1>
                                        <p className="text-muted-foreground text-sm text-balance">
                                            Enter your email, and the new password.
                                        </p>
                                  </div>

                                  <ForgotPasswordForm />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
 );
}
 
export default ForgotPassword;