// import { Notification } from "../models/Notification.model.js";
// import { User } from "../models/user.model.js";

// /**
//  * Create notification entries for all relevant users except the one who raised the concern.
//  * 
//  * @param {Object} options
//  * @param {String} options.concernType
//  * @param {String} options.concern
//  * @param {String} options.raisedByUserId
//  * @param {Boolean} options.isNotified
//  * @param {Boolean} options.isSomeoneReverted
//  * @param {Date} options.notificationDate
//  */
// export const createNotificationForConcern = async ({
//   concernType,
//   concernId,
//   concern,
//   raisedByUserId,
//   isNotified = true,
//   isSomeoneReverted = false,
//   notificationDate = new Date(),
// }) => {
//   try {
//     // 1. Get all users except the one who raised the concern
//     const usersToNotify = await User.find({ userId: { $ne: raisedByUserId } });

//     if (!usersToNotify.length) {
//       //console.log("No other users to notify.");
//       return;
//     }

//     // 2. Construct notification entries
//     const notifications = usersToNotify.map((user) => ({
//       userId: user.userId,
//       concernId,
//       concernType,
//       concernText: concern,
//       concernRaisedBy: raisedByUserId,
//       isNotified,
//       isSomeoneReverted,
//       notificationDate,
//     }));

//     // 3. Save them
//     await Notification.insertMany(notifications);
//     //console.log(`Created ${notifications.length} notifications.`);
//   } catch (err) {
//     console.error("Failed to create notifications:", err.message);
//   }
// };




// //Notification conctroller

// export const GetNotificationByUserIdOnQueryParams = async (req, res) =>{

//     const {userId, concernId, ConcernType, isNotified, isRead, isSomeoneReverted } = req.query; 


//     try {
        
//             const response = await Notification.find( req.query)

//             res.status(200).json({status:"Ok", data:response})

//     } catch (error) {
//         //console.log('Error occurred getting notification,', error)
//     }


// }















// import { Notification } from "../models/Notification.model.js";
// import { User } from "../models/user.model.js";

// /**
//  * Create notification entries for all relevant users except the one who raised the concern.
//  * 
//  * @param {Object} options
//  * @param {String} options.concernType
//  * @param {String} options.concern
//  * @param {String} options.raisedByUserId
//  * @param {Boolean} options.isNotified
//  * @param {Boolean} options.isSomeoneReverted
//  * @param {Date} options.notificationDate
//  */


// export const createNotificationForConcern = async ({



  
//   concernType,
//   concernId,
//   concern,
//   raisedByUserId,
//   isNotified = true,
//   isSomeoneReverted = false,
//   notificationDate = new Date(),
//   uri1, 
//   uri2,
//   uri3
// }) => {
//   try {
//     //console.log("Triggering createNotificationForConcern for", raisedByUserId);

//     // 1. Get the user who raised the concern
//     const raisedByUser = await User.findOne({ userId: raisedByUserId });

//     if (!raisedByUser) {
//       //console.log("Raising user not found.");
//       return;
//     }

//     // 2. Get all users except the one who raised the concern,
//     // and match those whose department is same and at least one common districtId
//     const usersToNotify = await User.find({
//       userId: { $ne: raisedByUserId },
//       department: raisedByUser.department,
//       districtIds: { $in: raisedByUser.districtIds },
//     });

//     if (!usersToNotify.length) {
//       //console.log("No other users to notify.");
//       return;
//     }

//     // 3. Construct notification entries
//     const notifications = usersToNotify.map((user) => ({
//       userId: user.userId,
//       concernId,
//       concernType,
//       concernText: concern,
//       concernRaisedBy: raisedByUserId,
//       isNotified,
//       isSomeoneReverted,
//       notificationDate,
//       uri1,
//       uri2,
//       uri3
//     }));

//     // 4. Save them
//     await Notification.insertMany(notifications);
//     //console.log(`Created ${notifications.length} notifications.`);
//   } catch (err) {
//     console.error("Failed to create notifications:", err.message);
//   }
// };



// //Notification conctroller

// export const GetNotificationByUserIdOnQueryParams = async (req, res) =>{

//   //console.log('i am insided notificatio')

//     const {userId, concernId, ConcernType, isNotified, isRead, isSomeoneReverted } = req.query; 


//     try {
        
//             const response = await Notification.find( req.query)

//             res.status(200).json({status:"Ok", data:response})

//     } catch (error) {
//         //console.log('Error occurred getting notification,', error)
//     }


// }



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
  role,
  concern,
  raisedByUserId,
  isNotified = true,
  isSomeoneReverted = false,
  notificationDate = new Date(),
  uri1,
  uri2,
  uri3,
  conditionalRole,
}) => {
  try {
    //console.log("Triggering createNotificationForConcern for", raisedByUserId);
    //console.log(conditionalRole)

    // 1. Get the user who raised the concern
    const raisedByUser = await User.findOne({ userId: raisedByUserId });

    if (!raisedByUser) {
      //console.log("Raising user not found.");
      return;
    }

    // ----> HARD-CODED FOR NOW; FRONTEND WILL SEND THIS LATER
    const allowedRoles = conditionalRole.split(",");  //[ 'Community Manager']

    // 2. Get all users except the one who raised the concern,
    // and match those whose department is same and at least one common districtId
    const usersToNotify = await User.find({
      userId: { $ne: raisedByUserId },
      department: raisedByUser.department,
      districtIds: { $in: raisedByUser.districtIds },
      role: { $in: allowedRoles }  // <-- Add role-based filtering for hierarchy
    });

    if (!usersToNotify.length) {
      //console.log("No other users to notify.");
      return;
    }

    // 3. Construct notification entries
    const notifications = usersToNotify.map((user) => ({
      userId: user.userId,
      concernId,
      role,
      concernType,
      concernText: concern,
      concernRaisedBy: raisedByUserId,
      isNotified,
      isSomeoneReverted,
      notificationDate,
      uri1,
      uri2,
      uri3
    }));

    // 4. Save them
    await Notification.insertMany(notifications);
    //console.log(`Created ${notifications.length} notifications.`);
  } catch (err) {
    console.error("Failed to create notifications:", err.message);
  }
};


//Notification conctroller

export const GetNotificationByUserIdOnQueryParams = async (req, res) =>{

  //console.log('i am insided notificatio')

    const {userId, concernId, ConcernType, isNotified, isRead, isSomeoneReverted } = req.query; 


    try {
        
            const response = await Notification.find( req.query)

            res.status(200).json({status:"Ok", data:response})

    } catch (error) {
        //console.log('Error occurred getting notification,', error)
    }


}