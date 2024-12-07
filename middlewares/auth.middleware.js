import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken|| req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            res.status(401).json({ error: "Unauthorized access" });

        }
        console.log(token);
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const  user= await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user)
        {
            res.status(401).json({ error: "Invalid user token" });

        }
        req.user=user;
        next();
    } catch (error) {
        res.status(401).json({ error: error?.message || "Invalid access token" });

    }

})
