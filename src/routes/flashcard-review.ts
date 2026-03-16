import express from "express";
import { upsertFlashcardReview, getFlashcardReviews } from "../lib/db";
import { sm2, qualityFromButton } from "../lib/sm2";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/flashcard-review", async (req, res) => {
  try {
    const { materialId, cardIndex, rating } = req.body;

    if (!materialId || cardIndex === undefined || !rating) {
      return res.status(400).json({ error: "materialId, cardIndex, and rating are required" });
    }

    const quality = qualityFromButton(rating);
    const reviews = await getFlashcardReviews(materialId);
    const existingReview = reviews.find((r: any) => r.card_index === cardIndex);

    const currentEF = existingReview?.ease_factor ?? 2.5;
    const currentInterval = existingReview?.interval_days ?? 0;
    const currentReps = existingReview?.repetitions ?? 0;

    const result = sm2(quality, currentReps, currentEF, currentInterval);

    const id = existingReview?.id ?? uuidv4();
    await upsertFlashcardReview(
      id,
      materialId,
      cardIndex,
      result.easeFactor,
      result.interval,
      result.repetitions,
      result.nextReview.toISOString()
    );

    return res.json({
      success: true,
      nextReview: result.nextReview.toISOString(),
      interval: result.interval,
      easeFactor: result.easeFactor,
    });
  } catch (error) {
    console.error("Flashcard review error:", error);
    res.status(500).json({ error: "Failed to save review" });
  }
});

router.get("/flashcard-review", async (req, res) => {
  try {
    const materialId = req.query.materialId as string;
    if (!materialId) {
      return res.status(400).json({ error: "materialId required" });
    }
    const reviews = await getFlashcardReviews(materialId);
    return res.json({ reviews });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

export default router;
