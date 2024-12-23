import mongoose,{Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema (
    {
            username:{
                type: String,
                required: true,
                unique:true,
                lowercase:true,
                trim: true,
                index:true
            },
            email:{
                type: String,
                required: true,
                unique:true,
                lowercase:true,
                trim: true,
                index:true
            },
            fullName:{
                type: String,
                required: true,
                trim: true,
                index:true
            },
            profileImage:{
                type:String,
            },
            events:
            [
                {
                type:Schema.Types.ObjectId,
                ref:"events"
                }
            ],
            password:{
                type:String,
                required:[true,'Password is required']
            },
            refreshToken:{
                type:String
            },
            branch:{
                type: String,
                required: true,
                trim: true,
                index:true
            },
            year:{
                type: String,
                required: true,
                trim: true,
                index:true
            },
            isVerified:{
                type:Boolean,
                default:false
            },
            resetPasswordToken:String,
            resetPasswordExpiresAt:Date,
            verificationToken:String,
            verificationTokenExpiresAt:Date,

    },
    {
        timestamps: true
    }
)
//PRE HOOK IS USE TO check data just before saving tha data that any changes occur with respect to previous data
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken =function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
            branch: this.branch,
            year: this.year,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    ) 
}
userSchema.methods.generateRefreshToken =function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model('User',userSchema)