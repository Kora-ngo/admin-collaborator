import dotenv from 'dotenv';
import { type Request, type Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import sequelize from '../config/database.js';
import Media from "../models/media.js";
import { MediaLink } from "../models/index.js";


dotenv.config();


// Validate required environment variables
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error(
    "Missing Cloudinary configuration. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
  );
}

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

interface UploadedFileInfo {
    media_id: number;
    file_name: string;
    file_type: 'image' | 'document';
    storage_path: string;
    size: number;
}

const MediaController =  {

    /**
         * Upload files and link them to an entity
         * Can be used by any module (project, delivery, etc.)
    */

    uploadAndLinkFiles: async (
            files: Express.Multer.File[],
            entityType: string,
            entityId: number,
            usage: 'cover' | 'document',
            organisationId: number,
            membershipId: number,
            externalTransaction?: any
        ): Promise<UploadedFileInfo[]> => {
            // Use provided transaction or create new one
            const transaction = externalTransaction || await sequelize.transaction();
            const shouldCommit = !externalTransaction; // Only commit if we created the transaction

            try {
                const uploadedFiles: UploadedFileInfo[] = [];

                for (const file of files) {
                    // Determine file type
                    const isImage = file.mimetype.startsWith('image/');
                    const fileType: 'image' | 'document' = isImage ? 'image' : 'document';

                    // Upload to Cloudinary
                    const uploadResult = await new Promise<any>((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            {
                                folder: `${organisationId}/${entityType}`,
                                resource_type: isImage ? 'image' : 'raw',
                                public_id: `${Date.now()}_${file.originalname.replace(/\.[^/.]+$/, '')}`,
                            },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                        uploadStream.end(file.buffer);
                    });

                    // Save to Media table
                    const media = await Media.create({
                        organisation_id: organisationId,
                        file_name: file.originalname,
                        file_type: fileType,
                        size: file.size,
                        storage_path: uploadResult.secure_url, // Remote URL
                        uploaded_by_membership_id: membershipId,
                        updated_at: new Date()
                    }, { transaction });

                    // Create MediaLink
                    await MediaLink.create({
                        media_id: media.id,
                        entity_type: entityType,
                        entity_id: entityId,
                        usage: usage,
                        updated_at: new Date()
                    }, { transaction });

                    uploadedFiles.push({
                        media_id: media.id,
                        file_name: file.originalname,
                        file_type: fileType,
                        storage_path: uploadResult.secure_url,
                        size: file.size
                    });

                    console.log(`Uploaded ${file.originalname} to Cloudinary: ${uploadResult.secure_url}`);
                }

                // Only commit if we created the transaction
                if (shouldCommit) {
                    await transaction.commit();
                }

                return uploadedFiles;

            } catch (error) {
                // Only rollback if we created the transaction
                if (shouldCommit) {
                    await transaction.rollback();
                }
                console.error('Media upload error:', error);
                throw error;
            }
    },


    /**
         * Get all media for an entity
     */

    getEntityMedia: async (req: Request, res: Response) => {
        try {
            const { entityType, entityId } = req.params;

            const mediaLinks = await MediaLink.findAll({
                where: {
                    entity_type: entityType,
                    entity_id: entityId
                },
                include: [
                    {
                        model: Media,
                        as: 'media',
                        attributes: ['id', 'file_name', 'file_type', 'size', 'storage_path', 'created_at']
                    }
                ]
            });

            res.status(200).json({
                type: 'success',
                data: mediaLinks
            });

        } catch (error) {
            console.error('Get entity media error:', error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    },


    /**
         * Delete media file
    */

    deleteMedia: async (req: Request, res: Response) => {
        const transaction = await sequelize.transaction();

        try {
            const { mediaId } = req.params;

            const media = await Media.findByPk(mediaId);

            if (!media) {
                res.status(404).json({
                    type: 'error',
                    message: 'media_not_found'
                });
                return;
            }

            // Extract public_id from Cloudinary URL
            const urlParts = media.storage_path.split('/');
            const publicIdWithExt = urlParts.slice(-2).join('/');
            const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');

            // Delete from Cloudinary
            await cloudinary.uploader.destroy(publicId, {
                resource_type: media.file_type === 'image' ? 'image' : 'raw'
            });

            // Delete MediaLinks
            await MediaLink.destroy({
                where: { media_id: mediaId },
                transaction
            });

            // Delete Media record
            await media.destroy({ transaction });

            await transaction.commit();

            res.status(200).json({
                type: 'success',
                message: 'media_deleted'
            });

        } catch (error) {
            await transaction.rollback();
            console.error('Delete media error:', error);
            res.status(500).json({ type: 'error', message: 'server_error' });
        }
    }

};

export default MediaController;