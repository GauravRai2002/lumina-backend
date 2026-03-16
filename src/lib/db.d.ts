import Database from "better-sqlite3";
export declare function getDb(): Database.Database;
export declare function createMaterial(id: string, title: string, sourceType: string, rawText: string): void;
export declare function getMaterial(id: string): {
    id: string;
    title: string;
    source_type: string;
    raw_text: string;
    created_at: string;
} | undefined;
export declare function getAllMaterials(): {
    id: string;
    title: string;
    source_type: string;
    created_at: string;
}[];
export declare function deleteMaterial(id: string): void;
export declare function saveGeneratedContent(id: string, materialId: string, type: string, content: string): void;
export declare function getGeneratedContent(materialId: string, type: string): {
    id: string;
    material_id: string;
    type: string;
    content: string;
    created_at: string;
} | undefined;
export declare function getFlashcardReviews(materialId: string): {
    id: string;
    material_id: string;
    card_index: number;
    ease_factor: number;
    interval_days: number;
    repetitions: number;
    next_review: string | null;
    last_reviewed: string | null;
}[];
export declare function upsertFlashcardReview(id: string, materialId: string, cardIndex: number, easeFactor: number, intervalDays: number, repetitions: number, nextReview: string): void;
export declare function saveChatMessage(id: string, materialId: string, role: string, content: string): void;
export declare function getChatHistory(materialId: string): {
    id: string;
    material_id: string;
    role: string;
    content: string;
    created_at: string;
}[];
//# sourceMappingURL=db.d.ts.map