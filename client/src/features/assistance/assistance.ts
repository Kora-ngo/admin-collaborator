export interface AssistanceType {
    id?: number | any;
    name: string;
    unit: string;
    date_of?: any;
    update_of?: any;
}

export interface Assistance {
    id?: number;
    uid?: number;
    name: string;
    description?: string;
    assistance_id: number;
    created_by?: number;
    status?: string;
    assistanceType?: AssistanceType,
    date_of?: Date;
    update_of?: Date;
}