import jwt from 'jsonwebtoken'
import User from "../models/Users.js"
import dotenv from "dotenv";
dotenv.config();

export const protectRoute= async(req,res,next)=>{
    const token=req.cookies.jwt;
    try {
        if(!token){
            return res.status(401).json({message:"unauthorized -no token provided"})
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)

        if(!decoded){
            return res.status(401).json({message:"unauthorized inavalid token"})
        }
        const user = await User.findById(decoded.userId).select("-password")

        if(!user){
             return res.status(401).json({message:"unauthorized inavalid token"})
        }
        
        req.user=user;
        next();
    } catch (error) {
        console.error(error)

    }
}