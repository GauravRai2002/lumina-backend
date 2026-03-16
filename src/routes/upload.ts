/// <reference path="../types/youtube-transcript.d.ts" />
import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { createMaterial } from "../lib/db";
import { PDFParse, VerbosityLevel } from "pdf-parse";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const contentType = req.headers["content-type"] || "";

    // Handle YouTube/Text JSON Body
    if (contentType.includes("application/json")) {
      const { youtubeUrl, text, title } = req.body;

      if (youtubeUrl) {
        try {
          // Must use the ESM bundle path directly — the default CJS entry is broken
          const { YoutubeTranscript } = await import("youtube-transcript/dist/youtube-transcript.esm.js");
          const transcript = await YoutubeTranscript.fetchTranscript(youtubeUrl);
          const transcriptText = transcript.map((t: any) => t.text).join(" ");
          if (!transcriptText.trim()) return res.status(400).json({ error: "Empty transcript" });

          const id = uuidv4();
          const videoId = youtubeUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1] || "video";
          const videoTitle = `YouTube: ${videoId}`;
          await createMaterial(id, videoTitle, "youtube", transcriptText);
          return res.json({ id, title: videoTitle, sourceType: "youtube", textLength: transcriptText.length });
        } catch (ytErr: any) {
          console.error("YouTube transcript error:", ytErr?.message || ytErr);
          return res.status(400).json({ error: "Failed to fetch YouTube transcript" });
        }
      }

      if (text) {
        const id = uuidv4();
        await createMaterial(id, title || "Pasted Text", "text", text);
        return res.json({ id, title: title || "Pasted Text", sourceType: "text", textLength: text.length });
      }

      return res.status(400).json({ error: "Invalid JSON body" });
    }

    // Handle File Upload
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file provided" });

    const ext = file.originalname.split(".").pop()?.toLowerCase() || "";
    const buffer = fs.readFileSync(file.path);

    if (ext === "pdf") {
      const parser = new PDFParse({ data: new Uint8Array(buffer), verbosity: VerbosityLevel.ERRORS });
      const result = await parser.getText();
      const extractedText = result.text;
      if (!extractedText.trim()) return res.status(400).json({ error: "Could not extract text from PDF" });

      const id = uuidv4();
      const title = file.originalname.replace(/\.pdf$/i, "");
      await createMaterial(id, title, "pdf", extractedText);
      return res.json({ id, title, sourceType: "pdf", textLength: extractedText.length });
    }

    if (["txt", "md"].includes(ext)) {
      const text = buffer.toString("utf-8");
      const id = uuidv4();
      await createMaterial(id, file.originalname, "text", text);
      return res.json({ id, title: file.originalname, sourceType: "text", textLength: text.length });
    }

    // Setup basic OCR stub for MVP (images handled on frontend previously, skip for now)
    return res.status(400).json({ error: `Unsupported file type: .${ext}` });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
