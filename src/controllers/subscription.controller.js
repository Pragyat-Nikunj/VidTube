import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asycHandler.js";


const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // toggle subscription
  if (!channelId) {
    throw new ApiError(400, "Channel Id required.");
  }
  const channelExists = await User.findById(channelId);
  if (!channelExists) {
    throw new ApiError(404, "Channel not found.");
  }
  const userId = req.user?._id;

  if (userId.toString() === channelId.toString()) {
    throw new ApiError(400, "You can't subscribe your own channel");
  }
  const getSubscriber = await Subscription.findOne(
    {subscriber: userId,
    channel: channelId}
  );

  if (!getSubscriber) {
    const addSubscriber = await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });

    if (!addSubscriber) {
      throw new ApiError(400, "Something went wrong while subscribing.");
    }
    return res.status(201).json(new ApiResponse(201, addSubscriber, "Channel subscribed successfully."))
  }

  const deleteSubscriber = await Subscription.deleteOne(
    { subscriber: userId ,
     channel: channelId }
  );
  if (deleteSubscriber.deletedCount === 0) {
    throw new ApiError(400, "Failed to unsubscribe from the channel.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deleteSubscriber, "Channel unsubscribed successfully.")
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  
  if (!channelId) {
    throw new ApiError(400, "Channel Id required.");
  }
  
  const channelExists = await User.findById(channelId);
  if (!channelExists) {
    throw new ApiError(404, "Channel not found.");
  }

  const userId = req.user?._id;

   if (userId.toString() !== channelId.toString()) {
     throw new ApiError(
       403,
       "Not authorized to view subscribers of this channel."
     );
   }
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit; 
  const [totalCount, subscribers] = await Promise.all([
    Subscription.countDocuments({ channel: channelId }),
    Subscription.find({ channel: channelId })
      .populate("subscriber", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);
  
  return res.status(200).json(new ApiResponse(200, {totalCount, page, limit, subscribers}, "Channel Subscribers fetched successfully."));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "Subscriber Id Required.");
  }

  const userId = req.user?._id;

  if (userId.toString() !== subscriberId.toString()) {
    throw new ApiError(
      403,
      "Not authorized to view subscribers of this channel."
    );
  }
   const page = Math.max(1, parseInt(req.query.page) || 1);
   const limit = Math.min(100, parseInt(req.query.limit) || 20);
   const skip = (page - 1) * limit;
   const [totalCount, subscribers] = await Promise.all([
     Subscription.countDocuments({ subscriber: subscriberId }),
     Subscription.find({ subscriber: subscriberId })
       .populate("channel", "name email avatar")
       .sort({ createdAt: -1 })
       .skip(skip)
       .limit(limit)
       .lean(),
   ]);

   return res
     .status(200)
     .json(
       new ApiResponse(
         200,
         {totalCount,
         page,
         limit,
         subscribers},
         "Subscribed Channels fetched successfully."
       )
     );
});

//controller to get subscriber Count
const getChannelSubscriberCount = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel ID required.");
  }

  const channelExists = await User.findById(channelId);
  if (!channelExists) {
    throw new ApiError(404, "Channel not found.");
  }

  const subscriberCount = await Subscription.countDocuments({
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscriberCount },
        "Subscriber count fetched successfully."
      )
    );
});
export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels, getChannelSubscriberCount};
