// SM-2 Spaced Repetition Algorithm
// Based on the SuperMemo SM-2 algorithm

export interface SM2Card {
  easeFactor: number; // >= 1.3
  interval: number; // days
  repetitions: number;
  nextReview: Date;
}

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}

/**
 * Calculate next review parameters using SM-2 algorithm
 * @param quality - User's self-assessment (0-5):
 *   0 = complete blackout
 *   1 = incorrect, but remembered upon seeing answer
 *   2 = incorrect, but easy to recall after seeing answer
 *   3 = correct with serious difficulty
 *   4 = correct with some hesitation
 *   5 = perfect recall
 */
export function sm2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
): SM2Result {
  // Clamp quality to 0-5
  quality = Math.max(0, Math.min(5, Math.round(quality)));

  let newEF = easeFactor;
  let newInterval = interval;
  let newReps = repetitions;

  if (quality >= 3) {
    // Correct response
    if (newReps === 0) {
      newInterval = 1;
    } else if (newReps === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newReps += 1;
  } else {
    // Incorrect response — reset
    newReps = 0;
    newInterval = 1;
  }

  // Update ease factor
  newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    easeFactor: Math.round(newEF * 100) / 100,
    interval: newInterval,
    repetitions: newReps,
    nextReview,
  };
}

/**
 * Simple quality mapping from user button press
 */
export function qualityFromButton(button: "again" | "hard" | "good" | "easy"): number {
  switch (button) {
    case "again": return 1;
    case "hard": return 3;
    case "good": return 4;
    case "easy": return 5;
  }
}
