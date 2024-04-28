import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { eventRegister } from "../models/eventRegister.model.js"
import { ObjectId } from "mongodb"

const registerEvent = asyncHandler(async (req, res) => {
    const {eventId} = req.params
    console.log(eventId)

    if(!isValidObjectId(eventId)) throw new ApiError(400,"Invalid event ID") 

        const registerrEvent = await  eventRegister.create({
            registerUser: req.user?._id,
            event: new ObjectId( eventId)
        })
        if(!registerrEvent) throw new ApiError(500,'Failed to register for event')

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { registered: true ,
                registerEvent},
                "registered successfully"
            )
        );

})
// controller to get event registered by the user
const getUserRegisteredEvent = asyncHandler(async (req, res) => {
    const userId = req.user?._id

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
    console.log(events)
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

export {
   registerEvent,
   getUserRegisteredEvent
}