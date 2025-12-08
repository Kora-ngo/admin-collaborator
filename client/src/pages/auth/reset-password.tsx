import ResetPasswordForm from "../../features/auth/components/reset-password-form";

const ResetPassword = () => {
    return ( 
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="flex bg-accent/10 relative lg:block w-full h-full place-items-center-safe place-content-center-safe ">
                {/* <img src={img} className="w-auto h-70" /> */}
                {/* <div className="text-center mx-24 py-6">
                    <p>Easily manage books, members, and transactions from a single platform. Our library management system keeps everything organized, 
                    saves you time, and ensures a better experience for every reader.</p>
                </div> */}
            </div>
            <div className="flex flex-col gap-4 p-6 md:p-10">

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-sm">
                        <form className="flex flex-col gap-6">
                                <div className="flex flex-col items-start gap-2 text-start">
                                    <h1 className="text-2xl font-bold">Reset Your Password</h1>
                                    <p className="text-muted-foreground text-sm text-balance">
                                        {/* Enter your email, and we'll send a reset link. */}
                                    </p>
                                </div>

                                <ResetPasswordForm />
                        </form>
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default ResetPassword;