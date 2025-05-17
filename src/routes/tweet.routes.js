import {Router} from "express";
import { createTweet, getUserTweets, deleteTweet, updateTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//unsecured routes
router.route("/getUserTweets/:userId").get(getUserTweets);

//secured routes
router.route("/createTweet").post(verifyJWT, createTweet);
router.route("/updateTweet/:tweetId").patch(verifyJWT, updateTweet);
router.route("/deleteTweet/:tweetId").delete(verifyJWT, deleteTweet);


export default router