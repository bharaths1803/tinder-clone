import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import matchRoutes from "./routes/match.route.js"
import messageRoutes from "./routes/message.route.js"


dotenv.config()

const PORT=process.env.PORT || 5000

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/matches", matchRoutes)
app.use("/api/messages", messageRoutes)



app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
  connectDB()
})