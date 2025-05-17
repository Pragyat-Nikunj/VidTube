import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asycHandler.js";


const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  // create playlist

  const owner = req.user?._id;


  if (!name) {
    throw new ApiError(400, "Name of Playlist Required.")
  }

  if (!description) {
    throw new ApiError(400, "Description of playlist required.");
  }

  const playlist = await Playlist.create({
    owner,
    name,
    description
  });

  return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully."))
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  // get user playlists
  if (!userId) {
    throw new ApiError(400, "User Id required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User ID format.");
  }
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const totalCount = await Playlist.countDocuments({
    owner: userId
  });
  const userPlaylists = await Playlist.find({
    owner: userId
  }).select("name description _id").skip(skip).limit(limit).sort({createdAt: -1});

  if (userPlaylists.length === 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          userPlaylists: [],
          page: 0,
          totalPages: 0,
          totalCount: 0,
        },
        "No playlists found."
      )
    );
  }
  
  return res.status(200).json(new ApiResponse(200, {userPlaylists, page, totalPages: Math.ceil(totalCount/ limit), totalCount}, "Playlist fetched successfully."))
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // get playlist by id
  if (!playlistId) {
    throw new ApiResponse(400, "Playlist Id required.");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid User ID format.");
  }

  const playlist = await Playlist.findById(playlistId)
    .select("name description _id videos")
    

    if (!playlist) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Playlist not found."));
    }

  return res.status(200).json(new ApiResponse(200, playlist, " Playlist fetched successfully."))

});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const userId = req.user?._id;
  if (!playlistId) {
    throw new ApiError(400, "Playlist Id required.");
  }

  if (!videoId) {
    throw new ApiError(400, "Video Id required.");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid Playlist ID format.");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID format.");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist Not Found.")
  }

  if (playlist.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to modify this playlist.");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video Not Found.");
  }

  if (playlist.videos.some((id) => id.toString() === videoId.toString())) {
    throw new ApiError(400, "Video already exists in the playlist.");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  const updatedPlaylist = await Playlist.findById(playlistId).populate(
    "videos",
    "title thumbnail"
  );
  return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video added to playlist."));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  //  remove video from playlist
  const userId = req.user?._id;
  if (!playlistId) {
    throw new ApiError(400, "Playlist Id required.");
  }

  if (!videoId) {
    throw new ApiError(400, "Video Id required.");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid Playlist ID format.");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID format.");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist Not Found.");
  }

  if (playlist.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to modify this playlist.");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video Not Found.");
  }

  if (!playlist.videos.some((id) => id.toString() === videoId.toString())) {
    throw new ApiError(400, "Video doesn't exist in the playlist.");
  }

  playlist.videos = playlist.videos.filter(
    (id) => id.toString() !== videoId.toString()
  );

  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video removed from playlist."));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //  delete playlist

  const userId = req.user?._id;

  
  if (!playlistId) {
    throw new ApiError(400, "Playlist Id required.");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid Playlist ID format.");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  if (playlist.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized.")
  }
  
  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlaylist) {
    throw new ApiError(404, "Playlist Not Found.");
  }
  return res.status(200).json(new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully."))

});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  const userId = req.user?._id;

  if (!name && !description) {
    throw new ApiError(
      400,
      "Provide at least one field to update (name or description)."
    );
  }

  if (!playlistId) {
    throw new ApiError(400, "Playlist Id required.");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid Playlist ID format.");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  if (playlist.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized.");
  }
  const updates = {};

  if (name) updates.name = name;
  if (description) updates.description = description;
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: updates
    },
    {new: true}
  );
  
  return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully."))

});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
