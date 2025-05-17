import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getVideoComments, addComment, updateComment, deleteComment } from "../controllers/comment.controller.js";


const router = Router();

//unsecured routes
router.route("/videoComments/:videoId").get(getVideoComments);

//secured routes
router.route("/addComment/:videoId").post(verifyJWT, addComment);
router.route("/updateComment/:commentId").patch(verifyJWT, updateComment);
router.route("/deleteComment/:commentId").delete(verifyJWT, deleteComment);



export default router;