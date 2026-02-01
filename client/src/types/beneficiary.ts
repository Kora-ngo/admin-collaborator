// src/types/beneficiary.ts

export interface Beneficiary {
    id: number;
    uid: number;
    project_id: number;
    family_code: string;
    head_name: string;
    phone?: string;
    region?: string;
    village?: string;
    created_by_membership_id: number;
    created_at: Date;
    updated_at: Date;
    sync_source: 'web' | 'mobile';
    review_status: 'pending' | 'approved' | 'rejected';
    reviewed_by_membership_id?: number;
    reviewed_at?: Date;
    review_note?: string;
    
    // Relations
    project?: {
        id: number;
        name: string;
        status: string;
    };
    members?: BeneficiaryMember[];
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

export interface BeneficiaryMember {
    id: number;
    beneficiary_id: number;
    full_name: string;
    gender: 'male' | 'female' | 'other';
    date_of_birth: Date;
    relationship: string;
}