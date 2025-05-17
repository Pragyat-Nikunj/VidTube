import mongoose from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asycHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  // create tweet
  const {content} = req.body;

  const owner = await req.user._id;

  if (!owner) {
    throw new ApiError(404, "User not Found.");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "All Fields are required.");
  }

  try {
    const tweet = await Tweet.create({
        owner, 
        content
    })
    console.log(tweet);

    if (!tweet) {
        throw new ApiError(400, "Something went wrong. Please try again sometimes later.")
    }
    
    return res.status(200).json(new ApiResponse(200, tweet, "Tweet created successfully."))
  }
  catch(error) {
    throw new ApiError(500, "Something went wrong. Please try again sometimes later.")
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  // get user tweets
  const {userId} = req.params;

  if (!userId)
    throw new ApiError(400, "UserId required.")

  const tweets = await Tweet.find({owner: userId})
   
  if (!tweets?.length) 
    throw new ApiError(404, "There are no tweets by this user.");

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweet fetched successfully."));
});

const updateTweet = asyncHandler(async (req, res) => {
  // update tweet
  const {tweetId} = req.params;
  const {content} = req.body;

  if (!content?.trim())
    throw new ApiError(400, "Tweet Required");

  if (!tweetId) {
    throw new ApiError(400, "Tweet Id required");
  }
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: content
      }
    }, {new : true}
  );
  
  if (!tweet) {
    throw new ApiError(400, "Tweet doesn't Exist.");
  }

  return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully."));
});

const deleteTweet = asyncHandler(async (req, res) => {
  // delete tweet
  const {tweetId} = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet Id required.");
  }

  const tweet = await Tweet.deleteOne(
    {_id: tweetId}
  );
  
  if (!tweet) {
    throw new ApiError(400, "Tweet doesn't Exist.");
  }

  return res.status(200).json(new ApiResponse(200, tweet, "Tweet deleted successfully."));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
