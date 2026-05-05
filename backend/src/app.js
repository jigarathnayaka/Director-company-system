import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import documentRoutes from "./routes/documentRoutes.js";
import directorRoutes from "./routes/directorRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
  })
);

app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({
    message: "Director Company API is running"
  });
});

app.use("/api/documents", documentRoutes);
app.use("/api/directors", directorRoutes);

export default app;
