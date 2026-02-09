// utils/sessionManager.ts

/**
 * Session Manager
 * Ensures only ONE active tab per user account
 * Uses localStorage + BroadcastChannel for cross-tab communication
 */

const SESSION_KEY = 'app_session_id';
const SESSION_CHECK_INTERVAL = 2000; // Check every 2 seconds
const CHANNEL_NAME = 'session_channel';

class SessionManager {
    private sessionId: string | null = null;
    private checkInterval: ReturnType<typeof setInterval> | null = null; // ✅ Works
    private channel: BroadcastChannel | null = null;
    private onSessionExpired: (() => void) | null = null;

    constructor() {
        // Only run in browser
        if (typeof window === 'undefined') return;

        // Create BroadcastChannel for cross-tab communication
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        
        // Listen for messages from other tabs
        this.channel.onmessage = (event) => {
            if (event.data.type === 'NEW_SESSION') {
                this.handleSessionConflict();
            }
        };

        // Handle tab/window close
        window.addEventListener('beforeunload', () => {
            this.clearSession();
        });

        // Handle visibility change (tab switch)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkSession();
            }
        });
    }

    /**
     * Initialize new session when user logs in
     */
    initSession(onExpired: () => void): void {
        this.onSessionExpired = onExpired;
        
        // Generate unique session ID
        this.sessionId = this.generateSessionId();
        
        // Store in localStorage
        localStorage.setItem(SESSION_KEY, this.sessionId);
        
        // Broadcast to other tabs that new session started
        this.channel?.postMessage({ 
            type: 'NEW_SESSION', 
            sessionId: this.sessionId 
        });
        
        // Start monitoring
        this.startMonitoring();
        
        console.log('✅ Session initialized:', this.sessionId);
    }

    /**
     * Check if current tab's session is still valid
     */
    checkSession(): boolean {
        if (!this.sessionId) return false;
        
        const storedSessionId = localStorage.getItem(SESSION_KEY);
        
        // If stored session differs, current tab is obsolete
        if (storedSessionId !== this.sessionId) {
            console.warn('⚠️ Session conflict detected');
            this.handleSessionConflict();
            return false;
        }
        
        return true;
    }

    /**
     * Handle session conflict (another tab took over)
     */
    private handleSessionConflict(): void {
        console.log('🚨 Session expired - Another tab is active');
        
        // Stop monitoring
        this.stopMonitoring();
        
        // Clear local session ID (but keep localStorage for active tab)
        this.sessionId = null;
        
        // Trigger logout callback
        if (this.onSessionExpired) {
            this.onSessionExpired();
        }
    }

    /**
     * Start periodic session validation
     */
    private startMonitoring(): void {
        this.stopMonitoring(); // Clear existing interval
        
        this.checkInterval = setInterval(() => {
            this.checkSession();
        }, SESSION_CHECK_INTERVAL);
    }

    /**
     * Stop monitoring
     */
    private stopMonitoring(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * Clear session (on logout or tab close)
     */
    clearSession(): void {
        this.stopMonitoring();
        
        // Only clear localStorage if this is the active session
        const storedSessionId = localStorage.getItem(SESSION_KEY);
        if (storedSessionId === this.sessionId) {
            localStorage.removeItem(SESSION_KEY);
        }
        
        this.sessionId = null;
        console.log('Session cleared');
    }

    /**
     * Generate unique session ID
     */
    private generateSessionId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Destroy session manager (cleanup)
     */
    destroy(): void {
        this.stopMonitoring();
        this.channel?.close();
        this.onSessionExpired = null;
    }
}

// Export singleton instance
export const sessionManager = new SessionManager();