class GeminiKeyManager {
    constructor() {
        // Load all 5 API keys from environment variables
        this.apiKeys = [
            process.env.GEMINI_API_KEY_1,
            process.env.GEMINI_API_KEY_2,
            process.env.GEMINI_API_KEY_3,
            process.env.GEMINI_API_KEY_4,
            process.env.GEMINI_API_KEY_5
        ].filter(key => key); // Filter out undefined keys

        this.currentIndex = 0;

        if (this.apiKeys.length === 0) {
            throw new Error('No Gemini API keys configured');
        }

        console.log(`Initialized with ${this.apiKeys.length} Gemini API keys`);
    }

    // Get the next API key in round-robin fashion
    getNextApiKey() {
        const key = this.apiKeys[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
        return key;
    }

    // Get current index (useful for debugging)
    getCurrentIndex() {
        return this.currentIndex;
    }

    // Reset to first key (if needed)
    reset() {
        this.currentIndex = 0;
    }
}

// Create a singleton instance for the key manager
const geminiKeyManager = new GeminiKeyManager();

module.exports = { geminiKeyManager };