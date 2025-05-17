import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asycHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // toggle like on video
  const userId = req.user?._id;

  if (!videoId) {
    throw new ApiError(400, "Video Id Required.");
  }

  const like = await Like.findOne({
    video: videoId,
    likedBy: userId
  });

  if (!like) {
    try {
      const createLike = await Like.create({
        video: videoId,
        likedBy: userId,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, createLike, "Video Liked successfully."));
    } catch (err) {
      throw new ApiError(400, "Something went wrong while liking the comment.");
    }
  }

  const deleteLike = await Like.findOneAndDelete({
    video: videoId,
    likedBy: userId,
  });
  if (!deleteLike) {
    throw new ApiError(
      400,
      "Error while attempting to unlike. Like record not found or deletion failed."
    );
  }
  return res.status(200).json(new ApiResponse(200, null, "Video unliked successfully."))

});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  // toggle like on comment
   const userId = req.user?._id;

   if (!commentId) {
     throw new ApiError(400, "Comment Id Required.");
   }

   const like = await Like.findOne({
     comment: commentId,
     likedBy: userId,
   });

   if (!like) {
     try {
       const createLike = await Like.create({
         comment: commentId,
         likedBy: userId,
       });

       return res
         .status(200)
         .json(new ApiResponse(200, createLike, "Comment Liked successfully."));
     } catch (err) {
       throw new ApiError(
         400,
         "Something went wrong while liking the comment."
       );
     }
   }

   const deleteLike = await Like.findOneAndDelete({
     comment: commentId,
     likedBy: userId,
   });
   if (!deleteLike) {
     throw new ApiError(
       400,
       "Error while attempting to unlike. Like record not found or deletion failed."
     );
   }
   return res
     .status(200)
     .json(new ApiResponse(200, null, "Comment unliked successfully."));

});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  // toggle like on tweet
  const userId = req.user?._id;

  if (!tweetId) {
    throw new ApiError(400, "Tweet Id Required.");
  }

  const like = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (!like) {
    try {
      const createLike = await Like.create({
        tweet: tweetId,
        likedBy: userId,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, createLike, "Tweet Liked successfully."));
    } catch (err) {
      throw new ApiError(400, "Something went wrong while liking the tweet.");
    }
  }

  const deleteLike = await Like.findOneAndDelete({
    tweet: tweetId,
    likedBy: userId,
  });
  if (!deleteLike) {
    throw new ApiError(
      400,
      "Error while attempting to unlike. Like record not found or deletion failed."
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet unliked successfully."));

});

const getLikedVideos = asyncHandler(async (req, res) => {
  // get all liked videos
  const userId = req.user?._id;

  const likedVideos = await Like.find({
    likedBy: userId,
    video: { $exists: true, $ne: null },
  }).populate("video");

  if (!likedVideos || likedVideos.length === 0) {
    throw new ApiError(404, "No liked videos found for this user.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked Videos fetched successfully.")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };