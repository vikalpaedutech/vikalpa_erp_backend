// BACKEND/models/Concerns.model.js

import mongoose, {Schema} from "mongoose";


//Below schema is for the Concern Schema.

const ConcernsSchema = new Schema(

    

    {

        

        concernId: {type: String}, //Each concern have unique id.

         unqUserObjectId: {
                      type: mongoose.Schema.Types.ObjectId, // reference to User
                      ref: "User",
                      required: true,
                    },
        userId: {type: String}, //User id who raises concern
        concernType: {type: String}, //School, Tech, Individual.
        districtId: {type: String},
        blockId: {type: String},
        schoolId: {type: String,}, //School Id for which the concern is being raised
        concern: {type: String}, // remark related to concernType.
        classOfConcern: {type: String}, //Class (9, 10) for which concern was generated.
        remark: {type: String}, // concern reason will go here.
        concernStatusBySubmitter: {type: String}, //once the concern is acted upon, submitter updates this as Resolved, or Not-Resolved.
        dateOfSubmission: {type: Date}, //date when concern was reaised
        
        concernStatusByResolver: {type: String}, //person who is responsible. eg; Resolved, Working on it, 
        dateOfResolution: {type: Date}, //Date when concern was resolved
        // to resovle concern will update from his end if he has resolved it or not. This is also be used to approve leaves from respective manager.
        totalDaysOfLeaveAppliedFor: {type: Number}, 
        leavePeriodFrom: {type: Date}, //leave date from
        leavePeriodTo: {type: Date}, //leave date till
        leaveApprovalHR: {type: String}, //HR's approval on leaves
        subjectOfLeave: {type: String}, //Leave subject as in mail
        leaveBody: {type: String}, //description of leave.
        comment: {type: String}, //Any manual remark related to concern. for who raises concerns.
        commentByResolver: {type: String, default: null}, //Comment by resolver
        fileName: {type: String}, //Uploaded file name
        fileUrl: {type: String}, //Any type of required documents. Eg: medical letter, or any kind of letter related to schools and all.
        studentSrn: {type: String}, //In case of student regarding concerns 
        l1ApprovalOnLeave: {
            status: {type:String, default: "Pending"}, //Pending, Approved, Rejected
            approvedBy: { type: String, default: null },
            approvedOn: { type: Date, default: null },
            comment: { type: String, default: null }
            }, //hERIARCHICHAL APPROVAL, CCs leave will be approved by ACI,
        managerLevelApprovalOnLeave: {type: Object, default:{
            status: {type:String, default: "Pending"}, //Pending, Approved, Rejected
            approvedBy: { type: String, default: null },
            approvedOn: { type: Date, default: null },
            comment: { type: String, default: null }
            }, 
        },//Managers of respective departments will approve leaves



       //For tech concerns 
    

        actionRecommended: {type: String, default: null}, //it will be action recommended ont the tech equipment like new required, or fixing required like that
        activityOfPersonWhoResolvesTechConcerns: {type: String, default: null}, //activity like visited, resovled via call like that
    techVisitorRemark: {type: String, default:null}}, //Basically a string data which describes ho 
    // the solver solved the concern


   
    

    
        

        
    
    {
        timestamps:true
    }


)

export const Concern = mongoose.model("Concern", ConcernsSchema)