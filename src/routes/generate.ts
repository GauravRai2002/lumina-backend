import express from "express";
import { getMaterial, saveGeneratedContent, getGeneratedContent } from "../lib/db";
import { generateNotes, generateQuiz, generateFlashcards } from "../lib/ai";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const { materialId, type } = req.body;

    if (!materialId || !type) {
      return res.status(400).json({ error: "materialId and type are required" });
    }

    if (!["notes", "quiz", "flashcards"].includes(type)) {
      return res.status(400).json({ error: "type must be one of: notes, quiz, flashcards" });
    }

    const existing = await getGeneratedContent(materialId, type);
    if (existing) {
      return res.json({
        id: existing.id,
        type: existing.type,
        content: existing.content,
        cached: true,
      });
    }

    const material = await getMaterial(materialId);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    let content = "";
    if (type === "notes") content = await generateNotes(material.raw_text);
    else if (type === "quiz") content = await generateQuiz(material.raw_text);
    else if (type === "flashcards") content = await generateFlashcards(material.raw_text);

    const id = uuidv4();
    await saveGeneratedContent(id, materialId, type, content);

    return res.json({ id, type, content, cached: false });
  } catch (error) {
    console.error("Generate error:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

export default router;
