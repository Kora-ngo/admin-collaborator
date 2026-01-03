export interface ProjectAttributes {
    id: number;
    organisation_id: number;
    name: string;
    description?: string;
    status: 'true' | 'false' | 'pending' | 'ongoing' | 'done' | 'suspended';
    start_date?: Date;
    end_date?: Date;
    target_families?: number;
    created_at: Date;
}

export type ProjectCreationAttributes = Omit<ProjectAttributes, 'id' | 'created_at'>;



export interface ProjectMemberAttributes {
    id: number;
    project_id: number;
    membership_id: number;
    role_in_project: 'collaborator' | 'enumerator';
    assigned_at: Date;
}

export type ProjectMemberCreationAttributes = Omit<ProjectMemberAttributes, 'id' | 'assigned_at'>;



export interface ProjectAssistanceAttributes {
    id: number;
    project_id: number;
    assistance_id: number;
}

export type ProjectAssistanceCreationAttributes = Omit<ProjectAssistanceAttributes, 'id'>;