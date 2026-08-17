export interface Delivery {
    id: number;
    uid: number;
    project_id: number;
    beneficiary_id: number;
    delivery_date: string;
    notes?: string;
    created_by_membership_id: number;
    created_at: string;
    updated_at: string;
    sync_source: 'web' | 'mobile';
    review_status: 'pending' | 'approved' | 'rejected' | 'false';
    reviewed_by_membership_id?: number;
    reviewed_at?: string;
    review_note?: string;

    // Relations
    project?: {
        id: number;
        name: string;
        status: string;
    };
    beneficiary?: {
        id: number;
        family_code: string;
        head_name: string;
        phone?: string;
        region?: string;
        village?: string;
    };
    items?: DeliveryItem[];
    createdBy?: {
        id: number;
        role: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
    reviewedBy?: {
        id: number;
        role: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
}

export interface DeliveryItem {
    id: number;
    delivery_id: number;
    assistance_id: number;
    quantity: number;
    assistance?: {
        id: number;
        name: string;
        assistanceType?: {
            id: number;
            name: string;
            unit: string;
        };
    };
}