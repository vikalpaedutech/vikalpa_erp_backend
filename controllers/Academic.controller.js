import { TimeTable, LectureAndVideos } from "../models/AcademicModel.js";
import mongoose from "mongoose";


// // ============ CREATE ============
// export const CreateTimeTable = async (req, res) => {
//   try {
//     const {
//       unqUserObjectId,
//       time,
//       board,
//       batch,
//       objectiveOfDay,
//       subject,
//       chapter,
//       excerciseNo,
//       date,
//       isObjectiveDone,
//       remark
//     } = req.body;

//     console.log('I am in Academic.controller.js, api: CreateTimeTable');
//     console.log(req.body);

//     // Validate required fields
//     if (!unqUserObjectId || !time || !date) {
//       return res.status(400).json({
//         success: false,
//         message: "unqUserObjectId, time, and date are required fields"
//       });
//     }

//     // Validate ObjectId format
//     if (!mongoose.Types.ObjectId.isValid(unqUserObjectId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid unqUserObjectId format"
//       });
//     }

//     // Validate arrays (optional)
//     if (chapter && !Array.isArray(chapter)) {
//       return res.status(400).json({
//         success: false,
//         message: "chapter must be an array"
//       });
//     }

//     if (excerciseNo && !Array.isArray(excerciseNo)) {
//       return res.status(400).json({
//         success: false,
//         message: "excerciseNo must be an array"
//       });
//     }

//     // ❌ REMOVED DUPLICATE CHECK - No longer checking for existing entries

//     // Create new timetable entry
//     const newTimeTable = new TimeTable({
//       unqUserObjectId,
//       time,
//       board,
//       batch,
//       objectiveOfDay,
//       subject,
//       chapter: chapter || [],
//       excerciseNo: excerciseNo || [],
//       date: new Date(date),
//       isObjectiveDone: isObjectiveDone || false,
//       remark
//     });

//     await newTimeTable.save();

//     res.status(201).json({
//       success: true,
//       message: "TimeTable entry created successfully",
//       data: newTimeTable
//     });

//   } catch (error) {
//     console.error("Error creating timetable:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };







// ============ CREATE ============
export const CreateTimeTable = async (req, res) => {
  try {
    const {
      unqUserObjectId,
      time,
      board,
      batch,
      objectiveOfDay,
      subject,
      chapter,
      excerciseNo,
      date,
      isObjectiveDone,
      remark,
      book,
      lectureNo
    } = req.body;

    console.log('I am in Academic.controller.js, api: CreateTimeTable');
    console.log(req.body);

    // Validate required fields
    if (!unqUserObjectId || !time || !date) {
      return res.status(400).json({
        success: false,
        message: "unqUserObjectId, time, and date are required fields"
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(unqUserObjectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid unqUserObjectId format"
      });
    }

    // Validate arrays (optional)
    if (chapter && !Array.isArray(chapter)) {
      return res.status(400).json({
        success: false,
        message: "chapter must be an array"
      });
    }

    if (excerciseNo && !Array.isArray(excerciseNo)) {
      return res.status(400).json({
        success: false,
        message: "excerciseNo must be an array"
      });
    }

    // Create new timetable entry with all fields
    const newTimeTable = new TimeTable({
      unqUserObjectId,
      time,
      board: board || null,
      batch: batch || null,
      objectiveOfDay: objectiveOfDay || null,
      subject: subject || null,
      chapter: chapter || [],
      excerciseNo: excerciseNo || [],
      date: new Date(date),
      isObjectiveDone: isObjectiveDone || false,
      remark: remark || null,
      book: book || null,        // Save book field
      lectureNo: lectureNo || 0  // Save lectureNo field
    });

    await newTimeTable.save();

    res.status(201).json({
      success: true,
      message: "TimeTable entry created successfully",
      data: newTimeTable
    });

  } catch (error) {
    console.error("Error creating timetable:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};





// ============ GET TIME TABLE BY DATE OR DATE RANGE ============
export const GetTimeTable = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.body;

    console.log('I am in Academic.controller.js, api: GetTimeTable');
    console.log('Request body:', req.body);

    // Build query object
    let query = {};

    // Case 1: Single date provided
    if (date) {
      // Validate date format
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Please use valid date format (YYYY-MM-DD)"
        });
      }

      // Create date range for the entire day (start to end of day)
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    // Case 2: Date range provided (startDate and endDate)
    if (startDate && endDate) {
      // Validate date formats
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Please use valid date format (YYYY-MM-DD)"
        });
      }

      // Set start date to beginning of day
      parsedStartDate.setHours(0, 0, 0, 0);
      
      // Set end date to end of day
      parsedEndDate.setHours(23, 59, 59, 999);

      query.date = {
        $gte: parsedStartDate,
        $lte: parsedEndDate
      };
    }

    // Case 3: Neither date nor date range provided
    if (!date && !startDate && !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide either 'date' or both 'startDate' and 'endDate'"
      });
    }

    // Fetch timetable entries based on query
    const timeTableEntries = await TimeTable.find(query)
      .sort({ date: 1, time: 1 }) // Sort by date ascending, then by time
      .lean(); // Convert to plain JavaScript objects for better performance

    // Check if any entries found
    if (timeTableEntries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No timetable entries found for the given date(s)",
        data: []
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: `Found ${timeTableEntries.length} timetable entries`,
      count: timeTableEntries.length,
      data: timeTableEntries
    });

  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};






// ============ DELETE TIME TABLE (SINGLE OR BULK) ============
export const DeleteTimeTable = async (req, res) => {
  try {
    const { ids } = req.body;

    console.log('I am in Academic.controller.js, api: DeleteTimeTable');
    console.log('Request body:', req.body);

    // Validate input
    if (!ids) {
      return res.status(400).json({
        success: false,
        message: "Please provide 'ids' (single ID or array of IDs) to delete"
      });
    }

    // Convert to array if single ID is provided
    let idsArray = [];
    if (Array.isArray(ids)) {
      idsArray = ids;
    } else if (typeof ids === 'string') {
      idsArray = [ids];
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid format. 'ids' should be either a string or an array of strings"
      });
    }

    // Validate all IDs are valid ObjectId format
    const invalidIds = idsArray.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid ObjectId format for: ${invalidIds.join(', ')}`
      });
    }

    // Check if records exist before deletion
    const existingRecords = await TimeTable.find({
      _id: { $in: idsArray }
    });

    if (existingRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No timetable entries found for the provided ID(s)",
        deletedCount: 0
      });
    }

    // Perform deletion
    const result = await TimeTable.deleteMany({
      _id: { $in: idsArray }
    });

    // Get deleted records details
    const deletedRecords = existingRecords.map(record => ({
      _id: record._id,
      date: record.date,
      time: record.time,
      subject: record.subject,
      board: record.board
    }));

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} timetable entry(ies) deleted successfully`,
      deletedCount: result.deletedCount,
      deletedRecords: deletedRecords,
      requestedIds: idsArray
    });

  } catch (error) {
    console.error("Error deleting timetable:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};




// // ============ CREATE LECTURE/VIDEO ============
// export const CreateLectureAndVideos = async (req, res) => {
//   try {
//     const {
//       unqTimeTableId,
//       contentType,
//       subject,
//       board,
//       chapter,
//       batch,
//       sharedOn,
//       date,
//       filename,
//       fileUrl,
//       description,
//       isActive
//     } = req.body;

    


//     // Create new lecture/video entry
//     const newLectureVideo = new LectureAndVideos({
//       unqTimeTableId,
//       contentType: contentType || null,
//       subject: subject || timeTableExists.subject, // Auto-fill from TimeTable if not provided
//       board: board || timeTableExists.board, // Auto-fill from TimeTable if not provided
//       chapter: chapter || null,
//       batch: batch || timeTableExists.batch, // Auto-fill from TimeTable if not provided
//       sharedOn: sharedOn || null,
//       date: date ? new Date(date) : new Date(),
//       filename: filename || null,
//       fileUrl: fileUrl || null,
//       description: description || null,
//       isActive: isActive !== undefined ? isActive : true
//     });

//     await newLectureVideo.save();

//     // Populate the TimeTable details in response
//     const populatedData = await LectureAndVideos.findById(newLectureVideo._id)
//       .populate('unqTimeTableId', 'time board batch subject objectiveOfDay date');

//     res.status(201).json({
//       success: true,
//       message: "Lecture/Video entry created successfully",
//       data: populatedData
//     });

//   } catch (error) {
//     console.error("Error creating lecture/video:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };



// ============ CREATE LECTURE/VIDEO ============
export const CreateLectureAndVideos = async (req, res) => {
  try {
    const {
      unqTimeTableId,
      contentType,
      subject,
      board,
      chapter,
      batch,
      sharedOn,
      date,
      filename,
      fileUrl,
      description,
      isActive
    } = req.body;

    console.log('I am in Academic.controller.js, api: CreateLectureAndVideos');
    console.log('Request body:', req.body);

    // Validate required fields
    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: "Content Type is required"
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject is required"
      });
    }

    if (!board) {
      return res.status(400).json({
        success: false,
        message: "Board is required"
      });
    }

    if (!batch) {
      return res.status(400).json({
        success: false,
        message: "Batch is required"
      });
    }

    // Find TimeTable entry by subject, board, and batch
    let foundTimeTableId = null;
    
    try {
      // Build base query
      const query = {
        subject: subject,
        board: board,
        batch: batch
      };

      // If date is provided, find the most recent entry on or before this date
      if (date) {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          // Search for entries on or before the given date
          const endOfDay = new Date(parsedDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          query.date = {
            $lte: endOfDay
          };
        }
      }

      console.log('🔍 Searching TimeTable with query:', query);

      // Find the TimeTable entry - get the most recent one
      const timeTableEntry = await TimeTable.findOne(query)
        .sort({ date: -1 }) // Get the most recent one
        .lean();

      if (timeTableEntry) {
        foundTimeTableId = timeTableEntry._id;
        console.log('✅ Found TimeTable entry:', {
          _id: foundTimeTableId,
          date: timeTableEntry.date,
          time: timeTableEntry.time
        });
      } else {
        console.log('❌ No TimeTable entry found for the given criteria');
      }
    } catch (searchError) {
      console.error('Error searching TimeTable:', searchError);
      // Continue without TimeTable ID if search fails
    }

    // If unqTimeTableId is provided in request, use it (override the found one)
    let finalUnqTimeTableId = null;
    
    if (unqTimeTableId && unqTimeTableId.trim() !== "") {
      // Check if it's a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(unqTimeTableId)) {
        finalUnqTimeTableId = unqTimeTableId;
        console.log('📌 Using provided unqTimeTableId:', finalUnqTimeTableId);
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid unqTimeTableId format"
        });
      }
    } else if (foundTimeTableId) {
      // Use the found TimeTable ID if no custom ID was provided
      finalUnqTimeTableId = foundTimeTableId;
      console.log('📌 Using found TimeTable ID:', finalUnqTimeTableId);
    }

    // Prepare data for saving
    const dataToSave = {
      contentType: contentType || null,
      subject: subject || null,
      board: board || null,
      chapter: chapter || null,
      batch: batch || null,
      sharedOn: sharedOn || null,
      date: date ? new Date(date) : new Date(),
      filename: filename || null,
      fileUrl: fileUrl || null,
      description: description || null,
      isActive: isActive !== undefined ? isActive : true
    };

    // Only add unqTimeTableId if we have a valid one
    if (finalUnqTimeTableId) {
      dataToSave.unqTimeTableId = finalUnqTimeTableId;
    }

    console.log('📦 Data to save:', dataToSave);

    // Create new lecture/video entry
    const newLectureVideo = new LectureAndVideos(dataToSave);

    await newLectureVideo.save();

    // Populate the TimeTable details in response
    const populatedData = await LectureAndVideos.findById(newLectureVideo._id)
      .populate('unqTimeTableId', 'time board batch subject objectiveOfDay date');

    res.status(201).json({
      success: true,
      message: "Lecture/Video entry created successfully",
      data: populatedData,
      timetableLinked: !!finalUnqTimeTableId,
      timetableFound: !!foundTimeTableId
    });

  } catch (error) {
    console.error("Error creating lecture/video:", error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};





























// ============ GET LECTURE/VIDEO BY DATE OR DATE RANGE ============
export const GetLectureAndVideos = async (req, res) => {
  try {
    const { date, startDate, endDate, unqTimeTableId, subject, board, batch, contentType } = req.body;

    console.log('I am in Academic.controller.js, api: GetLectureAndVideos');
    console.log('Request body:', req.body);

    // Build query object
    let query = {};

    // Case 1: Single date provided
    if (date) {
      // Validate date format
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Please use valid date format (YYYY-MM-DD)"
        });
      }

      // Create date range for the entire day (start to end of day)
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    // Case 2: Date range provided (startDate and endDate)
    if (startDate && endDate) {
      // Validate date formats
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      
      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Please use valid date format (YYYY-MM-DD)"
        });
      }

      // Set start date to beginning of day
      parsedStartDate.setHours(0, 0, 0, 0);
      
      // Set end date to end of day
      parsedEndDate.setHours(23, 59, 59, 999);

      query.date = {
        $gte: parsedStartDate,
        $lte: parsedEndDate
      };
    }

    // Add optional filters
    if (unqTimeTableId) {
      // Validate if it's a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(unqTimeTableId)) {
        query.unqTimeTableId = unqTimeTableId;
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid unqTimeTableId format"
        });
      }
    }

    if (subject) {
      query.subject = { $regex: subject, $options: 'i' }; // Case-insensitive search
    }

    if (board) {
      query.board = { $regex: board, $options: 'i' };
    }

    if (batch) {
      query.batch = { $regex: batch, $options: 'i' };
    }

    if (contentType) {
      query.contentType = contentType;
    }

    // Case 3: Neither date nor date range provided
    if (!date && !startDate && !endDate && !unqTimeTableId && !subject && !board && !batch && !contentType) {
      // If no filters provided, fetch all entries (with limit for performance)
      const timeTableEntries = await LectureAndVideos.find({})
        .sort({ date: -1, createdAt: -1 }) // Sort by date descending, then by createdAt
        .limit(100) // Limit to prevent overwhelming response
        .populate('unqTimeTableId', 'time board batch subject objectiveOfDay date')
        .lean();

      if (timeTableEntries.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No lecture/video entries found",
          data: []
        });
      }

      return res.status(200).json({
        success: true,
        message: `Found ${timeTableEntries.length} lecture/video entries`,
        count: timeTableEntries.length,
        data: timeTableEntries
      });
    }

    // Fetch lecture/video entries based on query
    const lectureVideoEntries = await LectureAndVideos.find(query)
      .sort({ date: -1, createdAt: -1 }) // Sort by date descending, then by createdAt
      .populate('unqTimeTableId', 'time board batch subject objectiveOfDay date')
      .lean();

    // Check if any entries found
    if (lectureVideoEntries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No lecture/video entries found for the given criteria",
        data: []
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: `Found ${lectureVideoEntries.length} lecture/video entries`,
      count: lectureVideoEntries.length,
      data: lectureVideoEntries
    });

  } catch (error) {
    console.error("Error fetching lecture/video entries:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};







// ============ DELETE LECTURE/VIDEO (SINGLE OR BULK) ============
export const DeleteLectureAndVideos = async (req, res) => {
  try {
    const { ids } = req.body;

    console.log('I am in Academic.controller.js, api: DeleteLectureAndVideos');
    console.log('Request body:', req.body);

    // Validate input
    if (!ids) {
      return res.status(400).json({
        success: false,
        message: "Please provide 'ids' (single ID or array of IDs) to delete"
      });
    }

    // Convert to array if single ID is provided
    let idsArray = [];
    if (Array.isArray(ids)) {
      idsArray = ids;
    } else if (typeof ids === 'string') {
      idsArray = [ids];
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid format. 'ids' should be either a string or an array of strings"
      });
    }

    // Validate all IDs are valid ObjectId format
    const invalidIds = idsArray.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid ObjectId format for: ${invalidIds.join(', ')}`
      });
    }

    // Check if records exist before deletion
    const existingRecords = await LectureAndVideos.find({
      _id: { $in: idsArray }
    });

    if (existingRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No lecture/video entries found for the provided ID(s)",
        deletedCount: 0
      });
    }

    // Perform deletion
    const result = await LectureAndVideos.deleteMany({
      _id: { $in: idsArray }
    });

    // Get deleted records details
    const deletedRecords = existingRecords.map(record => ({
      _id: record._id,
      date: record.date,
      subject: record.subject,
      board: record.board,
      contentType: record.contentType,
      filename: record.filename,
      fileUrl: record.fileUrl
    }));

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} lecture/video entry(ies) deleted successfully`,
      deletedCount: result.deletedCount,
      deletedRecords: deletedRecords,
      requestedIds: idsArray
    });

  } catch (error) {
    console.error("Error deleting lecture/video entries:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
