import mongoose,{Schema} from 'mongoose'


const memberSchema = new Schema (
    {
            name:{
                type: String,
                required: true,
                trim: true,
                index:true
            },
            domain:{
                type: String,
                required: true,
                trim: true,
                index:true
            },
            profileImage:{
                type:String,
            },
            linkedlnIdId:{
                type: String,
                required: true,
                trim: true,
                index:true,
                unique:true
            },
    },
    {
        timestamps: true
    }
)




export const Member = mongoose.model('Member',memberSchema)