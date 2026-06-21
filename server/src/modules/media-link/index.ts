import MediaLink from "./media-link.model.js";
import Media from "../media/media.model.js";
import ProjectModel from "../project/project.model.js";

// Associations for MediaLink — extracted from the former models/index.ts

// MediaLink → Media
MediaLink.belongsTo(Media, {
    foreignKey: 'media_id',
    as: 'media'
});

// Polymorphic: MediaLink points to any entity
MediaLink.belongsTo(ProjectModel, {
    foreignKey: 'entity_id',
    constraints: false,
    scope: {
        entity_type: 'project'
    },
    as: 'project'
});

export default MediaLink;