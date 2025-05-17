import {Comment} from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/asycHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video Not Found.");
    }
    let comments;
     comments = await Comment.find({video: videoId}) .populate("owner", "username avatar").limit(limit).skip((page - 1) * limit).sort({createdAt: -1});

     if (comments.length === 0) {
       return res
         .status(200)
         .json(new ApiResponse(200, [], "No comments in this video."));
     }

        return res
          .status(200)
          .json(new ApiResponse(200, comments, "Comments fetched successfully."));
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const {content} = req.body;
    const owner = req.user?._id;
    if (!content) {
        throw new ApiError(400, "Content Required");
    }
    const comment = await Comment.create({
        video: videoId,
        content,
        owner
    });
    
    if (!comment) {
        throw new ApiError(400, "Something went wrong while adding a comment.");
    }

    return res.status(200).json(new ApiResponse(200, comment, "Comment Added successfully."))
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const {content} = req.body;
    if (!commentId) {
        throw new ApiError(400, "Comment Id required.")
    }
    if (!content) {
        throw new ApiError(400, "Content required.");
    }
    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {content}
        },
        {new: true}
    );
    if (!comment) {
        throw new ApiError(404, "Comment Not Found.");
    }


    return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully."))
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;

    if (!commentId) {
      throw new ApiError(400, "Comment Id required.");
    }

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
        throw new ApiError(400, "Comment Not Found.");
    }

    return res.status(200).json(new ApiResponse(200, comment, "Comment deleted successfully."));
})

export {getVideoComments, addComment, updateComment, deleteComment}