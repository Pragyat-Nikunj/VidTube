import {Router} from "express";
import { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//secured routes
router.route("/video/:videoId").post(verifyJWT, toggleVideoLike);
router.route("/comment/:commentId").post(verifyJWT, toggleCommentLike);
router.route("/tweet/:tweetId").post(verifyJWT, toggleTweetLike);
router.route("/videos").get(verifyJWT, getLikedVideos);

export default router;

