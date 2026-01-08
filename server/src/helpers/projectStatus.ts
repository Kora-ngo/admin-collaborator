import type { Model } from 'sequelize';

/**
 * Automatically determines project status based on start and end dates
 * 
 * Rules:
 * - "pending": Current date is before start_date
 * - "ongoing": Current date is between start_date and end_date
 * - "overdue": Current date is after end_date (and status is not manually set to 'done' or 'suspended')
 * 
 * Manual statuses ('done', 'suspended', 'false') are preserved
 */

export const determineProjectStatus = (
    start_date: Date | string, 
    end_date: Date | string,
    current_status?: string
): string => {
    const now = new Date();
    const start = new Date(start_date);
    const end = new Date(end_date);

    // Reset time to midnight for accurate date comparison
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Preserve manual statuses (these override automatic logic)
    if (current_status === 'done' || current_status === 'suspended' || current_status === 'false') {
        return current_status;
    }

    // Automatic status determination
    if (now < start) {
        return 'pending';
    } else if (now >= start && now <= end) {
        return 'ongoing';
    } else {
        return 'overdue';
    }
};

/**
 * Update project status in database based on dates
 * This actually updates the database record
 */
export const updateProjectStatusInDB = async (project: any): Promise<any> => {
    // Access dataValues if it exists, otherwise use the project directly
    const projectData = project.dataValues || project;
    
    if (!projectData.start_date || !projectData.end_date) {
        return project;
    }

    const currentStatus = projectData.status;
    const calculatedStatus = determineProjectStatus(
        projectData.start_date,
        projectData.end_date,
        currentStatus
    );

    // Only update if status has changed
    if (calculatedStatus !== currentStatus) {
        // If it's a Sequelize instance, use .update()
        if (typeof project.update === 'function') {
            await project.update({ status: calculatedStatus });
        } else {
            // If it's a plain object, we can't update it
            console.warn(`Cannot update project ${projectData.id} - not a Sequelize instance`);
        }
        console.log(`Project ${projectData.id} status updated: ${currentStatus} → ${calculatedStatus}`);
    }

    return project;
};

/**
 * Bulk update all projects' statuses in database
 * This is more efficient for multiple projects
 */
export const bulkUpdateProjectStatuses = async (projects: any[]): Promise<any[]> => {
    const updatePromises = projects.map(async (project) => {
        // Access dataValues if it exists
        const projectData = project.dataValues || project;
        
        if (!projectData.start_date || !projectData.end_date) {
            return project;
        }

        const currentStatus = projectData.status;
        const calculatedStatus = determineProjectStatus(
            projectData.start_date,
            projectData.end_date,
            currentStatus
        );

        // Only update if status has changed
        if (calculatedStatus !== currentStatus) {
            // If it's a Sequelize instance, use .update()
            if (typeof project.update === 'function') {
                await project.update({ status: calculatedStatus });
                console.log(`Project ${projectData.id} status updated: ${currentStatus} → ${calculatedStatus}`);
            } else {
                console.warn(`Cannot update project ${projectData.id} - not a Sequelize instance`);
            }
        }

        return project;
    });

    return await Promise.all(updatePromises);
};