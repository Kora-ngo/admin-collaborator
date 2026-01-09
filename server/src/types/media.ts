export interface MediaAttributes {
    id: number;
    organisation_id: number;
    file_name: string;
    file_type: 'image' | 'document';
    size: number;
    storage_path: string;
    uploaded_by_membership_id: number;
    created_at: Date;
    updated_at: Date;
}

export type MediaCreationAttributes = Omit<MediaAttributes, 'id' | 'created_at'>;

export interface MediaLinkAttributes {
    id: number;
    media_id: number;
    entity_type: string; // project, delivery.. etc
    entity_id: number;
    usage: 'cover' | 'document';
    created_at: Date; 
    updated_at: Date;

}

export type MediaLinkCreationAttributes = Omit<MediaLinkAttributes, 'id' | 'created_at'>;