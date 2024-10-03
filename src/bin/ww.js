import app from "../index.js";
import docRouter from "../routes/docs.js";
import dotenv from 'dotenv';
import mongoose from "mongoose";
dotenv.config();


//attach docs
app.use("/docs", docRouter);
const PORT = process.env.PORT || 3000;

const uri = "mongodb+srv://Mpho:flTfkgI7qOnJNIYp@milky.mrz11.mongodb.net/production?retryWrites=true&w=majority&appName=milky";

const dbInit = async () => {
    try {
        await mongoose.connect(uri);
        mongoose.set("strictQuery", false);
    }catch (err){
        console.error(err);
        process.exit(1);
    }

}
await dbInit();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



export default app;
