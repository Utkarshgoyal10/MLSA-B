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
            githubId:{
                type: String,
                required: true,
                trim: true,
                index:true
            },
    },
    {
        timestamps: true
    }
)




export const Member = mongoose.model('Member',memberSchema)