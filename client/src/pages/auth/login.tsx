// import { Link } from "react-router-dom";
import LoginForm from "../../features/auth/components/login-form";
import { useTranslation } from "../../context/translationContext";
// import 

const Login = () => {

    const {t} = useTranslation();

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
                                        <h1 className="text-2xl font-bold">{t("login_title")}</h1>
                                        <p className="text-muted-foreground text-sm text-balance">
                                        Log in to manage your team, projects, and field data
                                        </p>
                                  </div>

                                  <LoginForm />

                                    {/* <div className="w-full mt-2 border border-amber-400 rounded-sm bg-amber-50">
                                        <div className="flex items-center space-x-2 p-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-amber-500">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                            </svg>
                                            <p className="text-[12px] font-semibold text-amber-500"><span className="font-bold">Test Mode Active.</span> Kora is in an early testing phase. Your feedback helps shape the platform.</p>
                                        </div>
                                    </div> */}
{/* 
                                  <hr className="text-gray-200" />

                                  <div className="flex text-start text-sm space-x-2">
                                        <span className="font-semibold">New to kora ?</span>
                                        <Link to="/register" className="text-primary font-semibold underline underline-offset-4">
                                            Create an Admin account
                                        </Link>
                                  </div> */}

                                {/* <div className="flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-blue-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                    </svg>
                                    <p className="text-[14px] font-semibold text-blue-500"><span className="font-bold">Notice.</span> This link exist only for testing purposes</p>
                                </div> */}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
     );
}
 
export default Login;