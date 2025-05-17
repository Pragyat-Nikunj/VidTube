import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getSubscribedChannels, getChannelSubscriberCount, getUserChannelSubscribers, toggleSubscription} from "../controllers/subscription.controller.js";


const router = Router();

//unsecured routes
router.route("/channelSubscriberCount/:channelId").get(getChannelSubscriberCount);

//secured routes
router.route("/subscribedChannels/:subscriberId").get(verifyJWT, getSubscribedChannels);
router.route("/channelSubscribers/:channelId").get(verifyJWT, getUserChannelSubscribers);
router.route("/subscribe/:channelId").post(verifyJWT, toggleSubscription);

export default router;