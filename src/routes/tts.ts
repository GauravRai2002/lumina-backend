import express from "express";
import { EdgeTTS } from "@andresaya/edge-tts";

const router = express.Router();

router.post("/tts", async (req, res) => {
  try {
    const { text, voice = "en-US-AriaNeural" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const tts = new EdgeTTS();
    await tts.synthesize(text, voice, {
      outputFormat: "audio-24khz-96kbitrate-mono-mp3",
    });

    const audioBuffer = tts.toBuffer();

    res.set("Content-Type", "audio/mpeg");
    res.set("Content-Length", audioBuffer.length.toString());
    res.send(audioBuffer);
  } catch (error) {
    console.error("TTS generation error:", error);
    res.status(500).json({ error: "Failed to generate text-to-speech audio" });
  }
});

export default router;
