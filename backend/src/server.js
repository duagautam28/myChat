import express from 'express';
import  dotenv from 'dotenv';
dotenv.config();
import cookieParser from "cookie-parser"
import authRoutes from './authRoutes/auth.routes.js';
import userRoutes from './authRoutes/user.routes.js';
import chatRoutes from './authRoutes/chat.routes.js';
import { connectDB } from './lib/db.js';
import cors from "cors"
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT =process.env.PORT || 5000

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"], // ✅ Correct
  credentials: true
}));


app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

const frontendPath = path.resolve(__dirname, "../../frontend/dist");

// Debug: Log the frontend path
console.log("Frontend path:", frontendPath);

// Serve static files with explicit MIME types
app.use(express.static(frontendPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Handle React Router - serve index.html for non-API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});


app.listen(PORT, () => {
    console.log("Server is running on :", `http://localhost:${PORT}`);
    connectDB();
})