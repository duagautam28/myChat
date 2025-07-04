import express from 'express'
import { protectRoute } from '../middleware/auth.middleware.js';
const router = express.Router();
import { getRecommendedUsers,getMyFriends,sendFriendRequest,acceptFriendRequest,getFriendRequests , getOutGoingFriendReqs} from '../controllers/user.controller.js';

//apply middleware to all routes
router.use(protectRoute)

router.get("/",getRecommendedUsers)
router.get("/friends",getMyFriends)

router.post("/friend-request/:id",sendFriendRequest);
router.put("/friend-request/:id/accept",acceptFriendRequest);
router.get("/friend-requests",getFriendRequests)
router.get("/outgoing-friend-requests",getOutGoingFriendReqs)

export default router;