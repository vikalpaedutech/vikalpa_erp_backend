// BACKEND/controllers/UploadAttendancePdf.controller.js

//Business logic for UploadAttendancePdf.model.js

import { AttendancePdf } from "../models/UploadAttendancePdf.model.js";
import { Student } from "../models/student.model.js";
import DistrictBlockSchool from "./DistrictBlockSchool.json" assert { type: "json" };
import { uploadToDOStorage } from "../utils/digitalOceanSpacesAttendancePdf.utils.js";
import path from "path";
import multer from "multer";


//Createing a cron job for initializing attendance data in backend. So that i can track, 
//... both uploaded pdf (which has url and bollean type true) and not uploaded pdf.

export const createAttendancePdfCronJob = async () => {
    console.log("Running Attendance PDF Initialization Cron Job");
  
    try {
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  
      for (const school of DistrictBlockSchool) {
        const classes = ["9", "10"]; // Class 9 and 10
  
        for (const classofStudent of classes) {
          // Check if record already exists for this school and class today
          const alreadyExists = await AttendancePdf.findOne({
            schoolId: school.schoolId,
            classofStudent,
            dateOfUpload: {
              $gte: startOfToday,
            },
          });
  
          if (!alreadyExists) {
            const newRecord = new AttendancePdf({
              userId: "", // keep empty, will be set during actual upload
              districtId: school.districtId,
              districtName: school.districtName,
              blockId: school.blockId,
              blockName: school.blockName,
              schoolId: school.schoolId,
              schoolName: school.schoolName,
            //   dateOfUpload: new Date().toISOString().split["T"][0],
              classofStudent,
              isPdfUploaded: false,
              fileName: "",
              fileUrl: "",
            });
  
            await newRecord.save();
            console.log(`Initialized attendance for ${school.schoolName} - Class ${classofStudent}`);
          } else {
            console.log(`Already exists: ${school.schoolName} - Class ${classofStudent}`);
          }
        }
      }
  
      console.log("Attendance PDF initialization complete.");
    } catch (error) {
      console.error("Error in Attendance Cron Job:", error);
    }
  };
//-----------------------------------------------------------------------------
  
  //Get API. By school ID aND DATE

export const GetDataBySchoolId = async (req, res) => {

    const  {schoolId, dateOfUpload} = req.params;
    console.log(req.params)
    console.log(new Date(dateOfUpload))
    const formattedDate = new Date(dateOfUpload)
      try {
              const response = await AttendancePdf.find({schoolId: schoolId, dateOfUpload: formattedDate})
  
              res.status(200).json({status: "success", data: response})

              // console.log(response)
  
      } catch (error) {
          console.log("Error fetching data", error)
          
          res.status(500).json({status: "failed", message: error})
  
      }
  }

  //-----------------------------------------------------------


  //Patch API To update attendance file pdf
// Multer for memory storage
const storage = multer.memoryStorage();
export const uploadAttendancePdfFile = multer({ storage }).single('file');

// PATCH API to upload & update attendance PDF
export const PatchAttendancePdf = async (req, res) => {
    console.log(" I am inside patch attendance pdf controller")
  try {
    const { schoolId, classofStudent, dateOfUpload } = req.query;
    const file = req.file;
    const {userId} = req.body;

    console.log(req.body)
    console.log(req.query)
    console.log(req.file)

    if (!schoolId || !classofStudent || !dateOfUpload) {
      return res.status(400).json({ status: "Error", message: "Missing query parameters" });
    }

    if (!file) {
      return res.status(400).json({ status: "Error", message: "No file uploaded" });
    }

    const record = await AttendancePdf.findOne({ schoolId, classofStudent, dateOfUpload });

    if (!record) {
      return res.status(404).json({ status: "Error", message: "Attendance record not found" });
    }

    const fileExt = file.originalname.split('.').pop();
    const schoolNameSanitized = record.schoolName.toLowerCase().replace(/\s+/g, '_');
    const fileName = `${schoolNameSanitized}_${dateOfUpload}_${classofStudent}.${fileExt}`;

    const fileUrl = await uploadToDOStorage(file.buffer, `attendancepdf/${fileName}`, file.mimetype);

    record.fileName = fileName;
    record.fileUrl = fileUrl;
    record.isPdfUploaded = true;
    record.userId = userId || "Admin";

    await record.save();

    res.status(200).json({
      status: "Success",
      message: "PDF uploaded and attendance record updated",
      data: record,
    });

   

  } catch (error) {
    console.error("Error uploading PDF:", error.message);
    res.status(500).json({ status: "Error", message: error.message });
  }
};

//------------------------------------------------------------------------------------