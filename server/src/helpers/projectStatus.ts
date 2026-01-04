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
 * Apply automatic status to a project object
 */
export const applyProjectStatus = (project: any): any => {
    if (!project.start_date || !project.end_date) {
        return project;
    }

    const autoStatus = determineProjectStatus(
        project.start_date,
        project.end_date,
        project.status
    );

    return {
        ...project,
        status: autoStatus
    };
};

/**
 * Apply automatic status to multiple projects
 */
export const applyProjectStatusToAll = (projects: any[]): any[] => {
    return projects.map(project => {
        const plainProject = project.toJSON ? project.toJSON() : project;
        return applyProjectStatus(plainProject);
    });
};