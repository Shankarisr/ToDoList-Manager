import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import route from "./route/userRoute.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

mongoose
    .connect(MONGO_URL)
    .then(()=>{
        console.log("DB connected");
        app.listen(PORT,()=>{
            console.log(`Server running on PORT ${PORT}`);
        })
    })
    .catch((error)=>{
        console.log(error);
    });
    app.use("/api/todos",route);

