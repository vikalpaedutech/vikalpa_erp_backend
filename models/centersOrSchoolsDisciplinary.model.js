// /Backend/models/centersOrSchoolsDisciplinary.model.js

//This model is for center Discilplinary or intercation

import mongoose, {Schema} from "mongoose";

const centersOrSchoolsDisciplinarySchema = new Schema (

    {
        districtName: {type: String},
        blockName: {type: String},
        schoolName: {type: String},
        dateOfRecord: {
            type: Date,
            default: () => {
              const now = new Date();
              now.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00.000
              
              
              return now;
            }
          },
        subject: {type: String},
        classOfStudent: {type: String},
        disciplinaryOrInteraction: {type: String},
        disciplinaryOrInteractiionRemark: {type: String},
        remark: {type: String},
        userId: {type: String, ref: "User"}
    },
    {timestamps:true}
)

export const CenterOrSchoolDisciplinary = mongoose.model("CenterOrSchoolDisciplinary", centersOrSchoolsDisciplinarySchema)