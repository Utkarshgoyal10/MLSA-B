import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {eventModel} from "../models/events.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const allEvents = asyncHandler(async (req, res) => {
    try {
        const allEvent = await eventModel.aggregate([
            {
              $lookup: {
                from:'eventregisters',
                localField: '_id',
                foreignField:'event',
                as: 'registeredUser'
              }
            },
            {
              $addFields: {
                registeredUser: {
                  $size: "$registeredUser"
                }
              }
            }
          ])
        return res
        .status(200)
        .json(new ApiResponse(200, allEvent, "all events fetched successfully"));

    } catch (error) {
        throw new ApiError(400, "Unable to fetch events")
    }
})

const addEvent = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { eventName, date, eventInfo} = req.body

    if(!(eventName && date && eventInfo))
    {
        throw new ApiError(400,"Please  provide the required fields")
    }
    const imageLocalPath = req.files?.image[0]?.path
    if( !(imageLocalPath) )
    {
        throw new ApiError(402,'Some file missing')
    }

    const imageFile = await uploadOnCloudinary(imageLocalPath)
    if(!imageFile){
        new ApiError(400, 'Failed to save files in cloudinary')
    }

        const event= await eventModel.create({
            eventName, 
            date,
            image : imageFile.url,
            eventInfo
            })
    const eventUploaded = await eventModel.findById(event._id);

    if (!eventUploaded) {
        throw new ApiError(500, "videoUpload failed please try again !!!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, event, "event uploaded successfully"));
})

export {
    allEvents,
    addEvent,
}