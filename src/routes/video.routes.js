import mongoose from "mongoose";
import { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus } from "../controllers/video.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.middlewaress.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
//unsecured routes
router.route("/getAllVideos").get(getAllVideos);
router.route("/getVideoById/:videoId").get(getVideoById);

//secured routes
router.route("/publishVideo").post(verifyJWT, 
    upload.fields([
        {
            name : "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
        publishAVideo);
router.route("/updateVideo/:videoId").patch(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  updateVideo
);
router.route("/deleteVideo/:videoId").delete(verifyJWT, deleteVideo);
router.route("/togglePublish/:videoId").patch(verifyJWT, togglePublishStatus);


export default router;