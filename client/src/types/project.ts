export interface Project {
    id?: number;
    organisation_id: number;
    name: string;
    description?: string;
    status?: 'true' | 'false' | 'pending' | 'ongoing' | 'done' | 'suspended';
    start_date?: string | Date;
    end_date?: string | Date;
    target_families?: number;
    created_at?: Date;
}


export interface ProjectMember {
    id?: number;
    project_id?: number;
    membership_id: number;
    role_in_project: 'collaborator' | 'enumerator';
    assigned_at?: Date;
}


export interface ProjectAssistance {
    id?: number;
    project_id?: number;
    assistance_id: number;
}