import mongoose, {Schema} from "mongoose"

const eventRegisterSchema = new Schema({
    event: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "eventModel"
    },
    registerUser: {
        type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
        ref: "User"
    }
}, 
{timestamps: true}
)

export const eventRegister = mongoose.model("eventRegister", eventRegisterSchema)