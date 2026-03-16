import dotenv from "dotenv";
dotenv.config(); // Must be before route imports so env vars are available at module load time

import express from "express";
import cors from "cors";

import uploadRouter from "./routes/upload";
import generateRouter from "./routes/generate";
import chatRouter from "./routes/chat";
import flashcardReviewRouter from "./routes/flashcard-review";
import materialsRouter from "./routes/materials";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL as string,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import { getDb, initDb } from "./lib/db";

app.use("/api", uploadRouter);
app.use("/api", generateRouter);
app.use("/api", chatRouter);
app.use("/api", flashcardReviewRouter);
app.use("/api", materialsRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  try {
    await initDb(getDb());
    console.log("Database initialized successfully");
    app.listen(PORT, () => {
      console.log(`Lumina Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
