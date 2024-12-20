import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMatches,
  getUserProfiles,
  swipeLeft,
  swipeRight,
} from "../controllers/match.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/swipe-right/:likedUserId", swipeRight);
router.post("/swipe-left/:dislikedUserId", swipeLeft);

router.get("/", getMatches);
router.get("/user-profiles", getUserProfiles);

export default router;
