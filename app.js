import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: '*',
  }));
  app.use(cors());
app.use(cors(""));


app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



//routes

import userRouter from './routes/user.routes.js'
import eventRoute from './routes/event.routes.js'
import registerEvent from './routes/eventRegister.routes.js'
import dashboardRouter from "./routes/dashboard.routes.js";


//routes declaration

app.use('/api/user',userRouter);
app.use('/api/event',eventRoute);
app.use('/api/registerEvent',registerEvent);
app.use("/api/db", dashboardRouter);


export { app }
