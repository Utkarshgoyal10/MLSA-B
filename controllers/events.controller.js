import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {eventModel} from "../models/events.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"

const allEventsupcoming = asyncHandler(async (req, res) => {
    try {
      const currentDate = new Date();
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
            },
            {
              $match: {
                  date: { $gte: currentDate }
              }
          },
            {
              $sort: {
                  date: -1
              }
          }
          ])
        return res
        .status(200)
        .json(new ApiResponse(200, allEvent, "all upcoming events fetched successfully"));

    } catch (error) {
        throw new ApiError(400, "Unable to fetch events")
    }
})

const allEventspast= asyncHandler(async (req, res) => {
  try {
    const currentDate = new Date();
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
          },
          {
            $match: {
                date: { $lt: currentDate }
            }
        },
          {
            $sort: {
                date: -1
            }
        }
        ])
      return res
      .status(200)
      .json(new ApiResponse(200, allEvent, "all past events fetched successfully"));

  } catch (error) {
      throw new ApiError(400, "Unable to fetch events")
  }
})
const allEventssignin = asyncHandler(async (req, res) => {
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
            registeredUserNo: {
              $size: "$registeredUser"
            },
            isRegisteres: {
                              $cond: {
                                  if: {
                                      $in: [
                                        req.user?._id,
                                          "$registeredUser.registerUser"
                                      ]
                                  },
                                  then: true,
                                  else: false
                              }
                          }

          }
        },
        {
          $sort: {
              date: -1
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
const allEventssupcoming = asyncHandler(async (req, res) => {
  try {
    const currentDate = new Date();
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
            registeredUserNo: {
              $size: "$registeredUser"
            },
            isRegisteres: {
                              $cond: {
                                  if: {
                                      $in: [
                                        req.user?._id,
                                          "$registeredUser.registerUser"
                                      ]
                                  },
                                  then: true,
                                  else: false
                              }
                          }

          }
        },
        {
          $match: {
              date: { $gte: currentDate }
          }
      },
        {
          $sort: {
              date: 1
          }
      }
      ])
      return res
      .status(200)
      .json(new ApiResponse(200, allEvent, "all events fetched successfully"));

  } catch (error) {
    console.log(error)
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
const addImagesToEvent = async (req, res) => {
  const {eventId} = req.params
  console.log(eventId);

  try {
    // Fetch the event by its ID
    const event = await eventModel.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const cloudinaryResponses = [];

    // Upload the new images to Cloudinary
    for (const file of req.files) {
      const { path: localFilePath } = file;
      const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
      
      if (!cloudinaryResponse) {
        return res.status(500).json({ error: 'Failed to upload file to Cloudinary' });
      }

      cloudinaryResponses.push(cloudinaryResponse.secure_url);
    }

    // Update the images array of the event with the new image URLs
    event.images.push(...cloudinaryResponses);

    // Save the updated event to the database
    await event.save();

    res.status(200).json({ message: 'Images added to event successfully', event });
  } catch (error) {
    console.error('Error adding images to event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export {
    allEventsupcoming,
    allEventspast,
    addEvent,
    allEventssignin,
    addImagesToEvent,
    allEventssupcoming
}