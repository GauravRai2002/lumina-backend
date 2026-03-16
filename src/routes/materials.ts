import express from "express";
import { getAllMaterials, deleteMaterial } from "../lib/db";

const router = express.Router();

router.get("/materials", async (req, res) => {
  try {
    const materials = await getAllMaterials();
    return res.json({ materials });
  } catch (error) {
    console.error("Materials list error:", error);
    res.status(500).json({ error: "Failed to fetch materials" });
  }
});

router.delete("/materials", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }
    await deleteMaterial(id);
    return res.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete material" });
  }
});

export default router;
