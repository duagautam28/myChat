import User from "../models/Users.js";
import { upsertStreamUser } from "../lib/stream.js";    
// import { createAvatar } from "@dicebear/core";
// import { adventurer } from "@dicebear/collection";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function signup(req, res) {
  try { 
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "all fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters long" });
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "user already exists with this email" });
    }

    // Pick random seed
    // const seeds = ["Aiden", "Easton", "Ryan", "Kimberly", "Brian"];
    // const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];

    // // Create avatar
    // const avatar = createAvatar(adventurer, {
    //   seed: randomSeed,
    // });
    // const svg = avatar.toString();
      const idx = Math.floor(Math.random() * 100) + 1; // 1-100 included
    const pic = `https://avatar.iran.liara.run/public/${idx}.png`;

    // const pic="https://api.dicebear.com/9.x/adventurer/svg?seed=Jocelyn"

    // Create user
    const newUser = await User.create({
      email,
      password,
      fullName,
      profilePic: pic,
    });

  try{
    await upsertStreamUser({
        id:newUser._id.toString(),
        name:newUser.fullName,
        image:newUser.profilePic||""
    });
    console.log("Stream User Created");
  }catch(error){
    console.log("error in creating stream user");
  }
    // Create token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
}

export async function login (req, res) {
    
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid password or email" });
    }

    const isPassword = await user.matchPassword(password);
    if (!isPassword) {
      return res.status(400).json({ message: "Invalid password or email" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "logout successfully" });
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
}

export async function onboard(req,res){
  const userId=req.user._id
  try {
    const {fullName,bio,nativeLanguage,learninglanguages,location}=req.body;
    if(!fullName||!bio||!nativeLanguage||!learninglanguages||!location){
         return res.status(400).json({ message: "all fields are required",
          missingFields:[
            !fullName&&"fullName",
            !bio&&"bio",
            !nativeLanguage&&"nativeLanguage",
            !learninglanguages&&"learninglanguages",
            !location&&"location"
          ].filter(Boolean)
          });
        }
          const updatedUser=await User.findByIdAndUpdate(userId,{
            ...req.body,
            isOnbaoard:true
          },{new:true})
if(!updatedUser) return res.status(404).json({message:"user not found"})

try{
    await upsertStreamUser({
        id:updatedUser._id.toString(),
        name:updatedUser.fullName,
        image:updatedUser.profilePic
    });
    console.log("Stream User updated");
  }catch(error){
    console.log("error in creating stream user",(error));
  }

   res.status(201).json({success:true,user:updatedUser})
  } catch (error) {
    console.error("onboarding error:",error)
    res.status(500).json({message:"server error"})
  }
}