import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asycHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

// ... other imports

//---------This is to get the duration of the video using ffmpeg and ffprobe---------//
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static'; // <-- Import ffprobe-static
import { fileURLToPath } from 'url';      
import path from 'path';                  



// Get the correct paths directly from the packages
const ffmpegPath = ffmpegStatic;
const ffprobePath = ffprobeStatic.path; // <-- Use the path property from ffprobe-static

console.log('ffmpeg path:', ffmpegPath);
console.log('ffprobe path:', ffprobePath);

// Set the paths if they exist
let pathsSet = true; // Flag to track if paths are set correctly

if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
    console.log('FFmpeg path set.');
} else {
    console.error('ffmpeg-static path not found. Ensure ffmpeg-static is installed.');
    pathsSet = false;
}

if (ffprobePath) {
    ffmpeg.setFfprobePath(ffprobePath); // <-- Use the correct path variable
    console.log('FFprobe path set.');
} else {
    console.error('ffprobe-static path not found. Ensure ffprobe-static is installed.');
    pathsSet = false;
}

if (!pathsSet) {
    console.error("Critical ffmpeg/ffprobe paths missing. Video processing features might fail.");
   
}


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  // get all videos based on query, sort, pagination
   const pageNumber = parseInt(page, 10);
   const limitNumber = parseInt(limit, 10);

   if (isNaN(pageNumber) || pageNumber < 1) {
    throw new ApiError(400, "Page Number is invalid.");
   }
  
   if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
    throw new ApiError(400, "Limit is invalid.");
   }

   const filter = {};

   

   if (userId) {
    filter.owner = userId;
   }
   
   if (query) { 
  filter.$or = [
    {title: {$regex: query, $options: "i"}}, 
    {description: {$regex: query, $options: "i"}}
  ];
  }

  const allowedSortFields = ["createdAt", "views", "likes"];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt"
  const sortOrder = sortType === "asc" ? 1: -1;

  const sortObj = {};
  sortObj[sortField] = sortOrder;

  const skip = (pageNumber - 1) * limitNumber
  const videos = await Video.find(filter)
  .sort(sortObj)
  .skip(skip)
  .limit(limitNumber)

  const totalVideos = await Video.countDocuments(filter);
  const totalPages = Math.ceil(totalVideos / limitNumber);

  return res.status(200).json(new ApiResponse(200, {videos, totalVideos, totalPages}, "Video fetched successfully."))
});

const getVideoDuration = (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      const duration = metadata.format.duration;
      resolve(duration);
    });
  });
};


const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // get video, upload to cloudinary, create video
  console.log(title+" "+ description);
  
  if (!title) throw new ApiError(400, "Title required.");

  const videoLocalPath = req.files?.video?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  const seconds = await getVideoDuration(videoLocalPath);
  const minutes = Math.floor(seconds / 60);
  const second = Math.floor(seconds % 60).toString().padStart(2, "0");
  const duration = `${minutes}: ${second} seconds`;
  const owner = req.user?._id;
  if (!videoLocalPath) throw new ApiError(400, "Video required.");
  let video, thumbnail;
  try {
     video = await uploadOnCloudinary(videoLocalPath);
    console.log("Video Uploaded successfully", video);
    if (!video) {
      throw new ApiError(404, "Failed to upload video on Cloudinary.")
    }

    
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    console.log("Thumbnail Uploaded successfully", thumbnail);
    if (!thumbnail) {
      throw new ApiError(404, "Failed to upload thumbnail on Cloudinary.");
    }
    
    const uploadedVideo = await Video.create({
      title,
      description: description || "No description provided",
      videoFile: video?.url,
      thumbnail: thumbnail?.url,
      duration,
      owner
    });

    console.log(uploadedVideo);
    
    if (!uploadedVideo) 
      throw new ApiError(400, "Something went wrong while uploading a video.");

    return res
      .status(200)
      .json(new ApiResponse(200, uploadedVideo, "Video uploaded successfully"));
  }

  catch(error) {
    if (video)
      await deleteFromCloudinary(video.public_id);
    throw new ApiError(500, "Something went wrong while uploading video. This video was deleted.");
  }

});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // get video by id
  const video = await Video.findById(videoId);
  
  if (!video) {
    throw new ApiError(404, "Video Not Found")
  }

  return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully."))
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // update video details like title, description, thumbnail
  const { title, description } = req.body;
  const videoLocalPath = req.files?.video?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  const updatedfields = {};
  if (!videoId)
    throw new ApiError(400, "Video Id Required.");

  if (!videoLocalPath && !thumbnailLocalPath && !title && !description) {
    throw new ApiError(400, "Atleast one field is required to update video.");
  }
  if (!isValidObjectId(videoId)) {
     throw new ApiError(400, "Invalid Video Id.");
   }
   if (videoLocalPath) {
     const seconds = await getVideoDuration(videoLocalPath);
     const minutes = Math.floor(seconds / 60);
     const second = Math.floor(seconds % 60)
       .toString()
       .padStart(2, "0");

     const duration = `${minutes}: ${second} seconds`;
     updatedfields.duration = duration;
   }
   let video, thumbnail;
   if(videoLocalPath)
  {video = await uploadOnCloudinary(videoLocalPath);}
  if (thumbnailLocalPath)
  {thumbnail = await uploadOnCloudinary(thumbnailLocalPath);}
  
  
  if (videoLocalPath) {
    updatedfields.videoFile = video?.url;
  }
  if (thumbnailLocalPath) {
    updatedfields.thumbnail = thumbnail?.url;
  }
  if (title) {
    updatedfields.title = title;
  }
  if (description) {
    updatedfields.description = description;
  }
  
  updateVideo.updatedAt = Date.now();
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updatedfields,
    },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated Successfully."))
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  // delete video
  if (!videoId) 
    throw new ApiError(400, "Video Id required.")
  const video = await Video.findByIdAndDelete(
    videoId
  );

  if (!video)
    throw new ApiError(404, "Video Not Found.");

  return res.status(200).json(new ApiResponse(200, video, "Video Deleted Successfully."))
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id.");
  }
  if (!videoId) throw new ApiError(400, "Video Id required.");
  
  const video = await Video.findById(videoId);
  
  if (!video) {
    throw new ApiError(404, "Video Not Found.");
  }
  
  video.isPublished = video.isPublished === 1 ? 0 : 1;

  await video.save();

  return res.status(200).json(new ApiResponse(200, video, "Video publish status updated successfully."))
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
