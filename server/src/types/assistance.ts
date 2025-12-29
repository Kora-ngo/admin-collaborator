export interface AssistanceAttributes {
    id: number;
    uid: number;
    name: string;
    description: string;
    assistance_id: number;
    created_by: number;
    status: string;
    date_of: Date;
    update_of: Date;
}

export interface AssistanceTypeAttributes {
    id: number;
    name: string;
    unit: string;
    date_of: Date;
    update_of: Date;
}


export type AssistanceCreationAttributes = Omit<AssistanceAttributes, 'id'>;
export type AssistanceTypeCreationAttributes = Omit<AssistanceTypeAttributes, 'id'>;