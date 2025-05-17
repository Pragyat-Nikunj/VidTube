import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import {Video} from "../models/video.models.js";
import { Tweet } from "../models/tweet.models.js";
import { Comment } from "../models/comment.models.js";
import {Subscription} from "../models/subscription.models.js";
import {Like} from "../models/like.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asycHandler.js";


const getChannelStats = asyncHandler (async (req, res) => {
  // Get the channel stats like total video views, total subscribers, total videos, total likes etc.
   const { channelId } = req.params;

   if (!channelId) {
    throw new ApiError(400, "Channel Id Required.");
   }

   const channelExists = await User.findById(channelId);

   if (!channelExists) {
    throw new ApiError(404, "Channel Not Found.");
   }

   const userId = req.user?._id;

  if (userId.toString() !== channelId.toString()) {
    throw new ApiError(400, "No authorized access to Channel");
  }

  const totalVideos = await Video.countDocuments({
    owner: channelId
  });

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId
  });

  const totalViewsAgg = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId)
      }
    },
    {
      $group: {
        _id: null,
        totalViews : {$sum: "$views"}
      }
    }
  ]);
 
  const totalViews = (totalViewsAgg[0] && totalViewsAgg[0].totalViews) || 0;

  const videoIds = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]).then((docs) => docs.map((doc) => doc._id));
  
  const tweetIds = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]).then((docs) => docs.map((doc) => doc._id));

  const commentIds = await Comment.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]).then((docs) => docs.map((doc) => doc._id));

  const totalLikesAgg = await Like.aggregate([
    {
      $match: {
        likedBy: { $ne: new mongoose.Types.ObjectId(channelId) },
        $or: [
          { video: { $in: videoIds } },
          { comment: { $in: commentIds } },
           { tweet: { $in: tweetIds } },
        ],
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: { $sum: 1 },
      },
    },
  ]);

  const totalLikes = (totalLikesAgg[0] && totalLikesAgg[0].totalLikes) || 0;

  return res.status(200).json(new ApiResponse(200, {totalLikes, totalSubscribers, totalVideos, totalViews}, "Channel details fetched successfully."))
})

const getChannelVideos = asyncHandler( async (req, res) => {
  // Get all the videos uploaded by the channel
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel Id Required.");
  }

  const channelExists = await User.findById(channelId);

  if (!channelExists) {
    throw new ApiError(404, "Channel Not Found.");
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit; 

  const totalVideos = await Video.countDocuments({owner: channelId});

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        totalLikes: { $size: "$likes" },
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $addFields: {
        totalComments: { $size: "$comments" },
      },
    },
    {
      $project : {
        likes: 0,
        comments: 0
      }
    }
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          videos,
          page,
          totalVideos,
          totalPages: Math.ceil(totalVideos / limit),
        },
        "Videos fetched successfully."
      )
    );
})

export {getChannelStats, getChannelVideos}
