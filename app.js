//Creating express app here

import express from "express";
import {createAttendanceRecords} from "./controllers/cronAttendance.controller.js"


//Importing necessary packages.

import cors from "cors";

import cookieParser from "cookie-parser";

import bodyParser from "body-parser";

const {json, urlencoded} = bodyParser;

//_______________________________________________________________

//all middle wares and configuration are done by using app.use() method.

// creating expres app.

const app = express ();

//cors configuration.

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
}))

//_____________________________________________

//Configuration for accepting json format from frontend

app.use(json({
    limit: "16kb"
}));

//___________________________________________________________

app.use(express.json());

//Configuration for accepting url-encoded data.

app.use(urlencoded({
    extended:true,
    limit:"16kb"
}));

//Somtimes we would want to store public assests like images, doc, or any type of media...
//...So following is the configuration for that.

app.use(express.static("public"));

//____________________________________________________________________

//cookie-parser confugration.

app.use(cookieParser());

//______________________________________


//Below method runs every once in a day at a fixed time for studentAttendanceDump.
//cronAttendance
//createAttendanceRecords();

//____________________________________


//Importing routers

import districtRouter from "./routes/district.route.js";
import blockRouter from "./routes/block.route.js";
import schoolRouter from "./routes/school.route.js";
import studentRouter from "./routes/student.route.js";
import studentAttendanceRouter from "./routes/studentAttendance.route.js";
import examAndTestRouter from "./routes/examAndTest.route.js";
import marksRouter from "./routes/marks.route.js";
import billsRouter from "./routes/bills.route.js";
import empLeaveRouter from "./routes/empLeave.route.js";
import userRouter from "./routes/user.route.js";
import studentDisciplinaryRouter from "./routes/studentDisciplinary.route.js";






//using routes for route.g

app.use('/api', districtRouter);
app.use("/api", blockRouter);
app.use("/api", schoolRouter);
app.use("/api", studentRouter);
app.use("/api", studentAttendanceRouter);
app.use("/api", examAndTestRouter);
app.use("/api", marksRouter);
app.use("/api", billsRouter);
app.use("/api", empLeaveRouter);
app.use("/api", userRouter);
app.use("/api", studentDisciplinaryRouter);
//Exporting this express app.

export {app};

//__________________________

