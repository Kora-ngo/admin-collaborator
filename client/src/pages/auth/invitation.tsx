import logo from '../../assets/logo.svg';
import { Button } from '../../components/widgets/button';
import StatusBadge from '../../components/widgets/status-badge';

const Insitation = () => {
    return ( 
        <div className="h-screen w-full flex flex-col gap-4 bg-white">
            <div className="container py-4 mx-auto">
                <div className="mb-2">
                    <div className="flex items-center">
                        <img src={logo} className="size-12" />
                        <span className="ms-3 font-semibold text-3xl text-primary">Kora</span>
                    </div>
                </div>
            </div>
            <div className=" mx-auto flex flex-col items-center  space-y-3 h-full">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">You have been Invited</h2>
                    <p className='text-center text-gray-400 mb-4'>To join this organisation</p>
                </div>
                <div className="card border p-6 md:p-10 max-w-md w-200 border-gray-200 rounded-xl shadow-sm shadow-gray-100">
                    <div className="bg-primary w-14 h-14 p-2 rounded-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                        </svg>
                    </div>

                    <div className='mt-4'>
                        <div className='flex flex-row items-center gap-2'>
                            <h4 className='text-xl font-semibold'>Opendream</h4>
                            <p className='text-sm text-gray-400 font-medium'>- by Morel Denzel</p>
                        </div>
                        <div className='py-2'>
                            <StatusBadge text="Collaborator" />
                        </div>

                        <div className='py-4'></div>

                        <div className='border-t-1 border-gray-200 mt-4 pt-4'>
                            <div className='flex flex-row justify-end gap-4 items-center'>
                                <Button variant="ghost">
                                    Decline
                                </Button>
                                <Button>
                                    Accept Invitation
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default Insitation;