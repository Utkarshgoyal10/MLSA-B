import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {eventModel} from "../models/events.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { eventRegister } from "../models/eventRegister.model.js"

const dashboard = asyncHandler(async(req,res) =>{
    const userId = req.user._id;
    const user =await  User.findById(userId).select(
        "-password -refreshToken"
    );
    console.log(user)

    if(!isValidObjectId(userId))
    {
        throw  new ApiError(400,"Invalid user")
    }

    const events = await eventRegister.aggregate([
        {
            $match:{
                registerUser : new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup: {
              from: 'eventmodels',
              localField: 'event',
              foreignField: '_id',
              as: 'eventDetails'
            }
          },
          {
            $addFields: {
            eventDetails:{
              $first: "$eventDetails",
            }
            }
          }
    ])
    // console.log(events)
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                events,
                "registered event fetched successfully"
            )
        );

})
export{
    dashboard
}