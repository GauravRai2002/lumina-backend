import express from "express";
import { getMaterial, saveChatMessage, getChatHistory } from "../lib/db";
import { chatWithTutor } from "../lib/ai";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { materialId, message } = req.body;

    if (!materialId || !message) {
      return res.status(400).json({ error: "materialId and message are required" });
    }

    const material = await getMaterial(materialId);
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    await saveChatMessage(uuidv4(), materialId, "user", message);
    const history = await getChatHistory(materialId);
    const response = await chatWithTutor(message, material.raw_text, history);

    const responseId = uuidv4();
    await saveChatMessage(responseId, materialId, "assistant", response);

    return res.json({ id: responseId, response });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to get chat response" });
  }
});

router.get("/chat", async (req, res) => {
  try {
    const materialId = req.query.materialId as string;
    if (!materialId) {
      return res.status(400).json({ error: "materialId required" });
    }
    const messages = await getChatHistory(materialId);
    return res.json({ messages });
  } catch (error) {
    console.error("Chat history error:", error);
    res.status(500).json({ error: "Failed to get chat history" });
  }
});

export default router;
