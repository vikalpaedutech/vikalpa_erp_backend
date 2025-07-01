import { Notification } from "../models/Notification.model.js"



//api to get notification by user id.



// Get concerns grouped by concernType for a given userId

// export const getNotificationsByUserId = async (req, res) => {


//     console.log("I am inside get notification by user id API");
    

//     try {
//         const { userId } = req.query;

//         console.log(req.query)

//         if (!userId) {
//             return res.status(400).json({
//                 status: "Error",
//                 message: "Missing userId",
//             });
//         }

//         // Pipeline to group notifications by concernType
//         const groupedConcerns = await Notification.aggregate([
//             { $match: { userId } },
//             {
//                 $group: {
//                     _id: "$concernType",
//                     totalCount: { $sum: 1 },
//                     concerns: { $push: "$$ROOT" },
//                 },
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     concernType: "$_id",
//                     totalCount: 1,
//                     concerns: {
//                         $map: {
//                             input: "$concerns",
//                             as: "concern",
//                             in: {
                               
//                                 message: "$$concern.message",
//                                 uri1: "$$concern.uri1",
//                                 uri2: "$$concern.uri2",
//                                 uri3: "$$concern.uri3",
//                                 createdAt: "$$concern.createdAt",
//                                 // Add any other fields you want to return
//                             },
//                         },
//                     },
//                 },
//             },
//         ]);

//         res.status(200).json({
//             status: "Success",
//             data: groupedConcerns,
//         });

//     } catch (error) {
//         console.error("Error in getConcernsByUserId:", error.message);
//         res.status(500).json({
//             status: "Error",
//             message: "Server error",
//         });
//     }
// };




// export const getNotificationsByUserId = async (req, res) => {

//     console.log("I am inside get notification by user id API");

//     try {
//         const { userId } = req.query;

//         console.log(req.query);

//         if (!userId) {
//             return res.status(400).json({
//                 status: "Error",
//                 message: "Missing userId",
//             });
//         }

//         // Pipeline to group notifications by concernType, excluding 'Individual'
//         const groupedConcerns = await Notification.aggregate([
//             {
//                 $match: {
//                     userId,
//                     concernType: { $ne: "Individual" } // <-- Exclude 'Individual'
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$concernType",
//                     totalCount: { $sum: 1 },
//                     concerns: { $push: "$$ROOT" },
//                 },
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     concernType: "$_id",
//                     totalCount: 1,
//                     concerns: {
//                         $map: {
//                             input: "$concerns",
//                             as: "concern",
//                             in: {
//                                 message: "$$concern.message",
//                                 uri1: "$$concern.uri1",
//                                 uri2: "$$concern.uri2",
//                                 uri3: "$$concern.uri3",
//                                 createdAt: "$$concern.createdAt",
//                                 // Add any other fields you want to return
//                             },
//                         },
//                     },
//                 },
//             },
//         ]);

//         res.status(200).json({
//             status: "Success",
//             data: groupedConcerns,
//         });

//     } catch (error) {
//         console.error("Error in getConcernsByUserId:", error.message);
//         res.status(500).json({
//             status: "Error",
//             message: "Server error",
//         });
//     }
// };

















export const getNotificationsByUserId = async (req, res) => {

    console.log("I am inside get notification by user id API");

    try {
        const { userId } = req.query;

        console.log(req.query);

        if (!userId) {
            return res.status(400).json({
                status: "Error",
                message: "Missing userId",
            });
        }

        // Pipeline to group notifications by concernType, excluding 'Individual'
        const groupedConcerns = await Notification.aggregate([
            {
                $match: {
                    userId,
                    concernType: { $ne: "Individual" }, // <-- Exclude 'Individual'
                    isNotified: true                     // <-- Include only notified ones
                }
            },
            {
                $group: {
                    _id: "$concernType",
                    totalCount: { $sum: 1 },
                    concerns: { $push: "$$ROOT" },
                },
            },
            {
                $project: {
                    _id: 0,
                    concernType: "$_id",
                    totalCount: 1,
                    concerns: {
                        $map: {
                            input: "$concerns",
                            as: "concern",
                            in: {
                                message: "$$concern.message",
                                uri1: "$$concern.uri1",
                                uri2: "$$concern.uri2",
                                uri3: "$$concern.uri3",
                                createdAt: "$$concern.createdAt",
                                // Add any other fields you want to return
                            },
                        },
                    },
                },
            },
        ]);

        res.status(200).json({
            status: "Success",
            data: groupedConcerns,
        });

    } catch (error) {
        console.error("Error in getConcernsByUserId:", error.message);
        res.status(500).json({
            status: "Error",
            message: "Server error",
        });
    }
};

//------------------------------------------------


//patch notification by concernType,



export const patchNotificationByConcernTypeAndRole = async (req, res) => {
  console.log("I am inside patchNotificationByConcernTypeAndRole API");

  try {
    const { concernType, role, userId } = req.query;
console.log(req.query)
    if (!concernType || !role) {
      return res.status(400).json({
        status: "Error",
        message: "Missing concernType or role in query params",
      });
    }

    const result = await Notification.updateMany(
      { concernType, role, userId },
      {
        $set: {
          isRead: true,
          isNotified: false,
        },
      }
    );

    res.status(200).json({
      status: "Success",
      message: `Updated ${result.modifiedCount} notifications`,
    });

  } catch (error) {
    console.error("Error in patchNotificationByConcernTypeAndRole:", error.message);
    res.status(500).json({
      status: "Error",
      message: "Server error",
    });
  }
};
