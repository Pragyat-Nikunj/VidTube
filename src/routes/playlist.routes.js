import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { createPlaylist, getUserPlaylists, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist, getPlaylistById } from "../controllers/playlist.controller.js";

const router = Router();

router.route("/createPlaylist").post(verifyJWT, createPlaylist);
router.route("/user/:userId").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);
router.route("/:playlistId/videos/:videoId").put(verifyJWT, addVideoToPlaylist);
router.route("/:playlistId/videos/:videoId").delete(verifyJWT, removeVideoFromPlaylist);
router.route("/:playlistId").delete(verifyJWT, deletePlaylist);
router.route("/:playlistId").patch(verifyJWT, updatePlaylist);
export default router;