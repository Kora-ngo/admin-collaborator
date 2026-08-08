export type DataOperationType = 'IMPORT' | 'EXPORT';

export type DataOperationDataset = 'BENEFICIARIES' | 'PROJECTS' | 'DELIVERIES' | 'USERS';

export type DataOperationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type DataOperationFileType = 'XLSX' | 'CSV';

export interface DataOperationAttributes {
    id: number;
    uid: bigint;
    organization_id: number;
    performed_by_user_id: number;
    type: DataOperationType;
    dataset: DataOperationDataset;
    status: DataOperationStatus;
    file_name: string;
    file_type: DataOperationFileType;
    total_records?: number;
    successful_records?: number;
    failed_records?: number;
    started_at?: Date;
    completed_at?: Date;
    error_report_url?: string;
    created_at: Date;
}

export type DataOperationCreationAttributes = Omit<DataOperationAttributes,'id' | 'created_at' | 'status' | 'total_records' | 'successful_records' | 'failed_records' | 'started_at' | 'completed_at' | 'error_report_url'> & {
    status?: DataOperationStatus;
    total_records?: number;
    successful_records?: number;
    failed_records?: number;
    started_at?: Date;
    completed_at?: Date;
    error_report_url?: string;
};