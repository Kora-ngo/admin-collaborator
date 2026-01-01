// utils/cleanupOldDeleted.ts

import { Op } from 'sequelize';
import type { ModelCtor, Model } from 'sequelize';

/**
 * Generic cleanup: permanently deletes soft-deleted records older than X days
 * 
 * @param model - Your Sequelize model (e.g., AssistanceModel, UserModel, etc.)
 * @param days - Number of days after which deleted records are purged (default: 7)
 */
export const cleanupOldDeleted = async <T extends Model>(
  model: any,
  days: number = 7
) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deletedCount = await model.destroy({
        where: {
            status: 'false', 
            update_of: {
            [Op.lt]: cutoffDate,
            },
        },
    });

    if (deletedCount > 0) {
      console.log(`🗑️ Cleaned up ${deletedCount} old deleted record(s) from ${model.tableName}`);
    }
  } catch (error) {
    console.error(`Cleanup failed for ${model.tableName}:`, error);
    // Silent fail — never break the main request
  }
};