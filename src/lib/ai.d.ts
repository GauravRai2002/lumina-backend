export declare function generateWithAI(prompt: string): Promise<string>;
export declare function generateNotes(text: string): Promise<string>;
export declare function generateQuiz(text: string): Promise<string>;
export declare function generateFlashcards(text: string): Promise<string>;
export declare function chatWithTutor(question: string, context: string, chatHistory: {
    role: string;
    content: string;
}[]): Promise<string>;
//# sourceMappingURL=ai.d.ts.map