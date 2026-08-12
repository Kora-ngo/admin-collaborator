import { Button } from "../../../components/ui/button";


interface ConnectionErrorProps {
    onRetry: () => void;
    title?: string;
    message?: string;
    fullScreen?: boolean;
    retrying?: boolean;
}

const ConnectionError = ({
    onRetry,
    title = "No Internet Connection",
    message = "We couldn't reach the server. Check your connection and try again.",
    fullScreen = false,
    retrying = false,
}: ConnectionErrorProps) => (
    <div className={`flex flex-col bg-gray-50 items-center justify-center text-center px-6 ${fullScreen ? "h-screen bg-white" : "min-h-[50vh] py-16"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-20 font-bold text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12 18.75h.008v.008H12v-.008Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
        </svg>
        <p className="text-xl font-bold text-gray-800">{title}</p>
        <p className="text-md text-gray-500 mt-1 max-w-md">{message}</p>
        <Button onClick={onRetry} loading={retrying} className="mt-6">
            Retry
        </Button>
    </div>
);

export default ConnectionError;