import { Op } from 'sequelize';
import SubscriptionModel from '../models/Subscription.js'; // adjust path

interface SubscriptionCheckResult {
  isActive: boolean;
  subscription: any | null;
  message?: string;
}

/**
 * Checks the organization's active subscription and updates status if expired.
 * Returns whether the subscription is still valid.
 */
export async function checkAndUpdateSubscription(
  organizationId: number
): Promise<SubscriptionCheckResult> {
  try {
    // Find the latest active subscription (status = 'true')
    const subscriptionData = await SubscriptionModel.findOne({
      where: {
        organization_id: organizationId,
        status: 'true',
      },
      order: [['ends_at', 'DESC']], // most recent first
    });

    const subscription = subscriptionData?.dataValues;


    if (!subscription) {
      return {
        isActive: false,
        subscription: null,
        message: 'no_active_subscription',
      };
    }

    const now = new Date();
    const endsAt = new Date(subscription.ends_at!);

    // If expired or ends today → mark as expired
    if (endsAt <= now) {
      console.log("Let's Go")
      await subscriptionData.update({
        status: 'expired',
      });

      return {
        isActive: false,
        subscription,
        message: 'Subscription_has_expired',
      };
    }

    // Still valid
    return {
      isActive: true,
      subscription,
      message: 'Subscription is active',
    };
  } catch (error) {
    console.error('Subscription check error:', error);
    return {
      isActive: false,
      subscription: null,
      message: 'Error checking subscription',
    };
  }
}