// /Backend/models/centersOrSchoolsDisciplinary.model.js

//This model is for center Discilplinary or intercation

import mongoose, {Schema} from "mongoose";

const SchoolDisciplinarySchema = new Schema (

    {

    district_block_schoolsObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District_Block_School"
    },
    dateOfRecord: {
    type: Date,
            default: () => {
              const now = new Date();
              now.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00.000
              
              
              return now;
            }
          },
        subject: {type: String, default:null},
        batch: {type: String, default:null},
        status:{type:String, default:null}, //What type of indiscipline it is Poor, Avg, Good, Excellent
        remark: {type: String, default:null},
        unqUserObjectId: {
                              type: mongoose.Schema.Types.ObjectId, // reference to User
                              ref: "User",
                              default:null
                             
                            },
    },
    {timestamps:true}
)

export const SchoolDisciplinary = mongoose.model("SchoolDisciplinary", SchoolDisciplinarySchema)