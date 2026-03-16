export interface SM2Card {
    easeFactor: number;
    interval: number;
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
export declare function sm2(quality: number, repetitions: number, easeFactor: number, interval: number): SM2Result;
/**
 * Simple quality mapping from user button press
 */
export declare function qualityFromButton(button: "again" | "hard" | "good" | "easy"): number;
//# sourceMappingURL=sm2.d.ts.map