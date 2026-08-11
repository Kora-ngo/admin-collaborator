import { useState } from "react";
import { useNetworkStore } from "./store/networkStore";
import ConnectionError from "./connectionError";


// Wrap only the routed content area (e.g. the <Outlet /> inside your layout
// shell) — NOT the whole app. Sidebar/navbar stay mounted and visible;
// only the page content swaps to a retryable error state.
const NetworkGate = ({ children }: { children: React.ReactNode }) => {
    const isOffline = useNetworkStore((state) => state.isOffline);
    const [retryKey, setRetryKey] = useState(0);

    const handleRetry = () => {
        // Remounting `children` (the current route's page component) re-fires
        // its own data-fetching effect — refreshing just that page, not the
        // whole app. We optimistically clear the flag so it actually renders;
        // if the retry fails too, the axios interceptor flips isOffline back
        // to true on its own and we land back here automatically.
        useNetworkStore.getState().setOffline(false);
        setRetryKey((k) => k + 1);
    };

    if (isOffline) {
        return <ConnectionError onRetry={handleRetry} />;
    }

    return <div key={retryKey}>{children}</div>;
};

export default NetworkGate;