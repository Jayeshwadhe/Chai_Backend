import dotenv from "dotenv";
import connectDB from "./db/index.js";




dotenv.config({
    path: "./.env"
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`SERVER IS CONNECTED ON PORT ${process.env.PORT}`);
    })
}
)
.catch((err) => {
    console.log("MongoDB connection failed !!",err);
})












/*
import DB_NAME from './constants'
import express from "express"
const app = express()
(async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("error: ", error)
            throw err
        })

        app.listen(process.env.PORT, () =>{
            console.log(`App is listenin on ${process.env.PORT}`)
        })

    }catch(error){
        console.log("ERROR: ",error);
        throw err;

    }
})()
    */