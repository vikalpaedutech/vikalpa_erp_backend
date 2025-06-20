import { Notification } from "../models/Notification.model.js";
import { User } from "../models/user.model.js";

/**
 * Create notification entries for all relevant users except the one who raised the concern.
 * 
 * @param {Object} options
 * @param {String} options.concernType
 * @param {String} options.concern
 * @param {String} options.raisedByUserId
 * @param {Boolean} options.isNotified
 * @param {Boolean} options.isSomeoneReverted
 * @param {Date} options.notificationDate
 */
export const createNotificationForConcern = async ({
  concernType,
  concernId,
  concern,
  raisedByUserId,
  isNotified = true,
  isSomeoneReverted = false,
  notificationDate = new Date(),
}) => {
  try {
    // 1. Get all users except the one who raised the concern
    const usersToNotify = await User.find({ userId: { $ne: raisedByUserId } });

    if (!usersToNotify.length) {
      console.log("No other users to notify.");
      return;
    }

    // 2. Construct notification entries
    const notifications = usersToNotify.map((user) => ({
      userId: user.userId,
      concernId,
      concernType,
      concernText: concern,
      concernRaisedBy: raisedByUserId,
      isNotified,
      isSomeoneReverted,
      notificationDate,
    }));

    // 3. Save them
    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} notifications.`);
  } catch (err) {
    console.error("Failed to create notifications:", err.message);
  }
};




//Notification conctroller

export const GetNotificationByUserIdOnQueryParams = async (req, res) =>{

    const {userId, concernId, ConcernType, isNotified, isRead, isSomeoneReverted } = req.query; 


    try {
        
            const response = await Notification.find( req.query)

            res.status(200).json({status:"Ok", data:response})

    } catch (error) {
        console.log('Error occurred getting notification,', error)
    }


}