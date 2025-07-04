import User from "../models/Users.js";
import FriendRequest from "../models/FriendRequest.js"

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, //exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user's friends
        { isOnbaoard: true },
      ],
    });
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage learninglanguages");

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("error in myFriends controller:", error);
    res.status(500).json({ message: "internal server error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send a friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends" });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "A friend request already exists between you and this user" });
    }

    const newRequest = new FriendRequest({
      sender: myId,
      recipient: recipientId,
      status: "pending",
    });

    await newRequest.save();

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("error in sendFriendRequest controller:", error);
    res.status(500).json({ message: "internal server error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullname profilePic nativeLanguage learninglanguages");

    const outgoingReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullname profilePic nativeLanguage learninglanguages");

    res.status(200).json({ incomingReqs, outgoingReqs });
  } catch (error) {
    console.error("Error in getFriendRequests controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutGoingFriendReqs(req, res) {
  try {
    const outGoingFriendReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullname profilePic nativeLanguage learninglanguages");

    res.status(200).json(outGoingFriendReqs);
  } catch (error) {
    console.error("Error in getOutGoingFriendReqs controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
