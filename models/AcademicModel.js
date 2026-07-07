import mongoose , {Schema} from "mongoose";

const TimeTableSchema = new Schema(
  {
    unqUserObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Add index for faster user queries
    },
    time: {
      type: String,
      default: null,
      // Consider using a more specific format like "HH:mm"
      // Or use Date type for time
    },
    board: {
      type: String,
      default: null,
    },
    batch: {type:String, default: null},
    objectiveOfDay: {
      type: String,
      default: null,
    },//Class, lunch and all
    book:{type: String, default:null},
    lectureNo:{type: Number, default:0},
    subject: {
      type: String,
      default: null,
    },
    chapter: [{type: String, default: null}],
    excerciseNo:[{type: String, default: null}],
    date: {
      type: Date,
      default: () => new Date(), // Use function for dynamic default
      required: true, // Should be required for timetable
    },
    isObjectiveDone: {
      type: Boolean,
      default: false, // Better default than null
    },
    remark: {
      type: String,
      default: null,
      trim: true, // Automatically trim whitespace
    },

  },
  { 
    timestamps: true,
  }
);


export const TimeTable = mongoose.model("TimeTable", TimeTableSchema);










//Stores lecture and videos status
const LectureAndVideosSchema = new Schema(
  {
    unqTimeTableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeTable",
       required: false, 
      default: null  
    },
    contentType: {
      type: String,
      default: null,
    }, //["ppt", "note", "video", "pdf", "document", "other"],
    subject: {
      type: String,
      default: null,
    },
    board: {
      type: String,
      default: null,
    },
    
    chapter: {
      type: String,
      default: null,
    },
    batch: {
      type: String,
      default: null,
    },
    forClass:{type: String, default: null}, //like for class 9 or 10
    sharedOn: {
      type: String,
      default: null,
    }, //Whatsapp, Class Plus App, ERP
    date: {
      type: Date,
      default: () => new Date(),
      required: true,
    },
    filename: {
      type: String,
      default: null,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);


export const LectureAndVideos = mongoose.model("LectureAndVideos", LectureAndVideosSchema);