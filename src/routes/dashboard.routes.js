import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/channelStats/:channelId").get(verifyJWT, getChannelStats);
router.route("/channel/videos/:channelId").get(verifyJWT, getChannelVideos);

export default router;