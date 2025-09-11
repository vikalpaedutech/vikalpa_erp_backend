//BACKEND/models/userAccess.model.js

//This contains all the access that is to be given to a user.
//This is only for office staff and employees



import mongoose, { Schema } from "mongoose";

const UserAccessSchema = new Schema(
  {

    unqObjectId: {
    type: mongoose.Schema.Types.ObjectId, // reference to User
    ref: "User",
    required: true, 
    },

    userId: {type: String},

    //modular access



    // modules: [{type: String, default:[]}] ,//contains modules like Academics, Accounts, Bills, Hr

    // permission: [{type: String,enum:['create', 'read', 'write', 'delete', 'admin'], default:["read"]}]

    modules: [
        {
            name: {
                type: String,
                enum: ["Academics", "Accounts"]
            },

            accessLevel:{
                type: String,
                enum:['create', 'read', 'write', 'delete', 'admin'],
                default:'read'
            }
        }
    ],
    

    //Region-wise access

    region: [

        {
            districtId:{type: String},
            blockIds:[{
                blockId:{type: String},
                schoolIds:[
                    {

                        schoolId:{type: String}
                    
                    }
                    
                ]
            }]
        }

    ],


    classId: [{ type: String }], // Class id will be class 8, 9th, etc.

    
    
    
  },
  { timestamps: true }
);




export const UserAccess = mongoose.model("UserAccess", UserAccessSchema);

