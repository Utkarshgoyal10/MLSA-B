import "dotenv/config"
import connectdb from './db/db.js';
import {app} from "./app.js"
// dotenv.config({
//     path: './.env'
// })
connectdb()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`⚙️   Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

