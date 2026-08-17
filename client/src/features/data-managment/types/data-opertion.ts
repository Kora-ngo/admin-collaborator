import type { DataEntity, OperationStatus, OperationType } from ".";

export interface DataOperation {
    id: number;
    type: OperationType;
    entity: DataEntity;
    status: OperationStatus;
    records: number;
    file_name: string;
    created_by: string;
    created_at: string;
    error?: string;
}