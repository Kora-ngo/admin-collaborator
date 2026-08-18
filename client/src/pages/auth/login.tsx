// import { Link } from "react-router-dom";
import LoginForm from "../../features/auth/components/login-form";
import { useTranslation } from "../../app/provider/translationContext";
// import 

const Login = () => {

    const {t} = useTranslation();

    return ( 
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Desktop-only hero panel — fully hidden below lg, not just visually shrunk */}
                <div className="hidden lg:flex flex-col bg-gray-950 relative w-full h-full items-center justify-center">
                    <div className="flex space-x-2 items-center mb-10">
                        <img src="https://res.cloudinary.com/doqholno8/image/upload/v1771016666/white_logo_cbf8ki.png" className="size-12" />
                        <p className="text-4xl font-semibold text-white">Kora</p>
                    </div>
                    <img src="https://res.cloudinary.com/doqholno8/image/upload/v1771076469/login_hvaqbw.png" className="w-auto h-90" />
                        <div className="text-center font-semibold text-gray-500 mx-22 py-6">
                            <p>
                                Paper records get lost. Spreadsheets fall out of sync. Field teams work blind.
                                Kora replaces the chaos with one clear system, so your team spends less time
                                chasing data, and more time delivering real impact where it matters.
                            </p>
                        </div>
                </div>

                <div className="flex flex-col gap-4 md:p-10">

                    {/* Mobile-only logo — just the mark, nothing else */}

                    <div className="flex flex-1 items-center justify-center p-6 md:p-0">
                        <div className="w-full max-w-sm">
                            <form className="flex flex-col gap-6">
                                {/* <div className="lg:hidden flex justify-start pt-6">
                                    <div className="bg-primary p-2.5 rounded-lg shadow-sm shadow-primary/30">
                                        <img src="https://res.cloudinary.com/doqholno8/image/upload/v1771016666/white_logo_cbf8ki.png" className="w-auto h-10" />
                                    </div>
                                </div> */}
                                <div className="flex flex-col items-start gap-2 text-start">
                                    <h1 className="text-2xl font-bold">{t("login_title")}</h1>
                                    <p className="text-muted-foreground text-sm text-balance">
                                    Log in to manage your team, projects, and field data
                                    </p>
                                </div>

                                <LoginForm />

                            </form>
                        </div>
                    </div>

                    {/* Kora Field callout */}
                    <div className="flex justify-center px-6 pb-6 md:p-0">
                        <a
                            href="https://appdistribution.firebase.google.com/i/bb32de04fc79f8fd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center gap-4 w-full max-w-sm rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20 transition-all duration-200"
                        >
                            {/* App-icon-style badge */}
                            <div className="size-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/30">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                </svg>
                            </div>

                            <div className="min-w-0 flex-1 text-left">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Mobile App</p>
                                <p className="text-sm font-semibold text-gray-900 mt-0.5">Kora Field - For Enumerators</p>
                                <p className="text-xs text-gray-500 mt-0.5">Collect data on the ground offline</p>
                            </div>

                            {/* Arrow, in its own button-like circle */}
                            <div className="size-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-3.5 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                                </svg>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
     );
}
 
export default Login;