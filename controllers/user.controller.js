import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from 'mongoose'
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt  from 'jsonwebtoken';
const registerUser = asyncHandler(async(req,res)=>{
    // get details
    const {fullName,email,username,password,year,branch} = req.body
    
    //validation

    if([fullName,email,username,password,year,branch].some((field)=>{
        field?.trim() === "" 
    }))
    {
        throw new  ApiError(400,"All field are required")
    }
    //check user already exist

    const existeduser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existeduser)
    {
        throw  new ApiError(409,"Email or  username already exists")
    }
    console.log(req )
    //check for images,check for profileImage
    const profileImageLocalpath = req.files?.profileImage?.[0].path;
    if(!profileImageLocalpath)
    {
        throw  new ApiError(400,'profileImage file is required ')
    }

    //upload them on cloudinary
    const profileImage = await uploadOnCloudinary(profileImageLocalpath)
    if(!profileImage){
        throw  new ApiError(400,'profileImage file is required ')
    }
    //create user object 

    const user = await User.create({
        fullName,
        profileImage: profileImage.url,
        email,
        password,
        username : username.toLowerCase(),
        year,
        branch
    })

    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createduser){
        throw  new ApiError(500,"Something went wrong while creating the account ")
    }
    return  res.status(201).json(new ApiResponse(200,createduser,"user created successfully"))
})

const generateAcessAndRefreshTokens =  async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return{accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating token")
    }
}


const loginUser = asyncHandler(async(req,res)=>{
    const {email,username,password}= req.body

    if(!username && !email){
        throw  new ApiError(400,"Username or Email is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })
    // console.log(user._id)
    if(!user){
        throw   new ApiError(404,"Invalid User")
    }
    
    const isPasswordvalid=await user.isPasswordCorrect(password)

    if (!isPasswordvalid) {
        throw new ApiError(401,'Incorrect Password')
    }

    const {accessToken,refreshToken}=  await generateAcessAndRefreshTokens(user._id)

    const loggedUser =await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }
    // console.log(refreshToken,accessToken)

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken", refreshToken,options)
    .json
    (
        new ApiResponse(
            200,
            {
                user:loggedUser,accessToken,refreshToken
            },
            "user logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req,res)=>{
    console.log(req.user)

    await User.findByIdAndUpdate( req.user?._id,
        {
        $set:{"refreshToken":null}
    },
    {
        new:true
    })
    const user2 = await User.findById(req.user?._id)
    console.log(user2)

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(201)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},'Logged out Successfully'))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken,REFRESH_TOKEN_SECRET)
        const  user= await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, 'Invalid Refresh token')
        }
        if(incomingRefreshToken!==user?.refreshAccessToken){
            throw new ApiError(401,"Refresh token is expired of used")
        }
    
        const options = {
            httpOnly:true,
            secure : true
        }
        const {accessToken,newRefreshToken} = await generateAcessAndRefreshTokens(user._id)
    
        return res.status()
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken", newRefreshToken,options)
        .json
        (
            new ApiResponse(
                200,
                {
                    accessToken,refreshToken:newRefreshToken
                },
                "Acess Token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,"invalid refresh token")
    }

})

const changePassword = asyncHandler(async (req,res)=>{

    const {oldPassword,newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if( !isPasswordCorrect ){
        throw new ApiError(400,'Invalid Old Password')
        }
    user.password=newPassword
    await user.save({validateBeforeSave : false})

    return res.status(200)
    .json(new ApiResponse(200,{},"Password Changes Successfully"))
})

const getCurrentUser = asyncHandler(async  (req,res)=> {

    return res.status(200).json(new ApiResponse (200,req.user, 'User fetched'))
})

const updateUserDetails = asyncHandler(async (req,res,next)=>{

    const {fullName,email} = req.body

    if(!fullName || !email){
        throw  new ApiError(400,'Please provide full name and email address to update your profile!')
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullName:fullName,
            email:email,
        }
    },{new:true}).select("-password")
    return res.status(200)
    .json(new ApiResponse(200,user,"Account Details updated"))

})

const updateprofileImage = asyncHandler(async (req,res)=>{
    // console.log(req.files);

    const profileImageLocalPath = req.files?.profileImage[0]?.path
    // console.log(profileImageLocalPath)

    if(!profileImageLocalPath)
    {
        throw  new ApiError(400,'profileImage file is missing ')
    }

    //upload them on cloudinary
    // console.log(profileImageLocalpath,coverImageLocalPath);
    const profileImage = await uploadOnCloudinary(profileImageLocalPath)
    

    if(!profileImage.url)
    {
        throw new ApiError(400,"Error while uploading on profileImage")
    }
    const publicId = req.user.profileImage
    // console.log(publicId)
    deleteFromCloudinary(publicId)//delete old image from clodinary


    console.log("Updated Url::",profileImage.url);
    const updated = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            profileImage:profileImage.url
        }

    },{new:true}).select("-password")

    return res.status(200)
    .json(new ApiResponse(200,updated,"profileImage updated"))
})

const getUserProfile = asyncHandler(async (req,res)=> {

    const {username} = req.params
    console.log(username)
     if(!username?.trim()){
        throw  new ApiError(400,"Username is missing")
     }

     const channel =await  User.aggregate([
        {
                $match:{
                    username: username?.toLowerCase()
                }
        },
        {
            $lookup:{
                    from: "subsciptions",
                    localField:"_id",
                    foreignField: "channel",
                    as:"subscribers"
            }
        },
        {
            $lookup:{
                    from: "subsciptions",
                    localField:"_id",
                    foreignField: "subscriber",
                    as:"subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                IsSubscribed:1,
                profileImage:1,
                coverImage:1,
                email:1

            }
        }


    ])
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )




} )



const watchHistory = asyncHandler(async(req,res)=>{
    console.log(req.user._id)
    // console.log(mongoose.Types.ObjectId(req.user._id.toString()));
    // const c=String(req.user._id)
    // console.log

    const user = await User.aggregate([
        {
            $match: {
                // _id: new mongoose.Types.ObjectId(c), 
                username : req.user.username
            }
        },
        {
            $lookup:{
                from: 'videos',
                localField:'watchHistory',
                foreignField:'_id',
                as:'watchHistory',
                pipeline:[
                    {
                        $lookup:{
                            from:'users',
                            localField:'owner',
                            foreignField:'_id',
                            as: 'owner',
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        profileImage:1
                                    }
                                }
                            ]
                        },
                    },
                     {
                         $addFields:{
                             owner:{
                                 $first:"$owner"
                             }
                         }
                    }
                ]
                
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,user[0],"watchHistory"))



})



export {registerUser,loginUser,logoutUser,refreshAccessToken,changePassword,getCurrentUser,updateUserDetails,updateprofileImage,getUserProfile,watchHistory};

