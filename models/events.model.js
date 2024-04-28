import mongoose,{Schema} from 'mongoose'
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const eventSchema = new mongoose.Schema({
    eventName:String,
    date:String,
    image:String,
    eventInfo:String,
    // owner: {
    //     type: Schema.Types.ObjectId,
    //     ref: "User"
    // }
},
    {
        timestamps: true
    }

)
eventSchema.plugin(mongooseAggregatePaginate)
export const  eventModel = mongoose.model("eventModel",eventSchema)