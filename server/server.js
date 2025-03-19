// @ts-nocheck
const express=require("express");
const mongoose=require("mongoose");
const dotenv=require("dotenv");
const cors=require("cors");
const cookieParser=require("cookie-parser");

dotenv.config();

const app=express();
const port=5000;
const frontend_url=process.env.MODE==="development"
    ? process.env.FRONTEND_DEV_URL
    : process.env.FRONTEND_PROD_URL

app.use(cors({
    origin: frontend_url,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));


mongoose.connect(process.env.MONGO_URL)
    .then(()=>console.log("database connected"))
    .catch((error)=>console.log(error));

app.use(express.json());
app.use(cookieParser());
app.use("/", require("./routes"));

app.listen(port, ()=>console.log(`server listening on port ${port}`));