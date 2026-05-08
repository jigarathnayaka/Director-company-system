import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import documentRoutes from "./routes/documentRoutes.js";
import directorRoutes from "./routes/directorRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";

dotenv.config();

const app = express();

const defaultOrigins = ["http://localhost:5173", "http://localhost:5174"];
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : defaultOrigins;

app.use(
  cors({
    origin: allowedOrigins
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
app.use("/api/companies", companyRoutes);

export default app;
