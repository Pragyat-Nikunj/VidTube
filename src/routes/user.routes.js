import { Router } from "express";
import { loginUser, userRegister, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, getUserChannelProfile, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewaress.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//unsecured routes
router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount: 1,
        }, {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    userRegister);

router.route("/login").post(loginUser);
router.route("/refresh-Token").post(refreshAccessToken);

//secured routes
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar") ,updateUserAvatar);
router.route("/update-cover").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/history").get(verifyJWT, getWatchHistory);
router.route("/logout").post(verifyJWT, logoutUser);



export default router