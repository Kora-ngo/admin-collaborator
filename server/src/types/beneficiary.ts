// types/beneficiary.ts

export interface BeneficiaryAttributes {
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
}

export type BeneficiaryCreationAttributes = Omit<BeneficiaryAttributes, 'id' | 'created_at' | 'updated_at'>;

export interface BeneficiaryMemberAttributes {
    id: number;
    beneficiary_id: number;
    full_name: string;
    gender: 'male' | 'female' | 'other';
    date_of_birth: Date;
    relationship: string;
}

export type BeneficiaryMemberCreationAttributes = Omit<BeneficiaryMemberAttributes, 'id'>;

export interface DeliveryAttributes {
    id: number;
    uid: number;
    project_id: number;
    beneficiary_id: number;
    delivery_date: Date;
    notes?: string;
    created_by_membership_id: number;
    created_at: Date;
    updated_at: Date;
    sync_source: 'web' | 'mobile';
    review_status: 'pending' | 'approved' | 'rejected';
    reviewed_by_membership_id?: number;
    reviewed_at?: Date;
    review_note?: string;
}

export type DeliveryCreationAttributes = Omit<DeliveryAttributes, 'id' | 'created_at' | 'updated_at'>;

export interface DeliveryItemAttributes {
    id: number;
    delivery_id: number;
    assistance_id: number;
    quantity: number;
}

export type DeliveryItemCreationAttributes = Omit<DeliveryItemAttributes, 'id'>;

export interface SyncBatchAttributes {
    id: number;
    uid: number;
    project_id: number;
    submitted_by_membership_id: number;
    submitted_at: Date;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by_membership_id?: number;
    reviewed_at?: Date;
    review_note?: string;
}

export type SyncBatchCreationAttributes = Omit<SyncBatchAttributes, 'id'>;