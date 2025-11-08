import { GoogleGenAI, Type } from "@google/genai";
import { Idea } from '../types';

const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "A short, catchy name for the web app or SaaS idea.",
        },
        description: {
          type: Type.STRING,
          description: "A rich description, approximately 2-3 sentences long, for the web app, its target audience, and the main problem it solves. It should read like natural marketing copy.",
        },
        features: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: "A list of 3 key features. Each feature should be a full, descriptive sentence that clearly explains what the feature does, similar in style to 'Provides real-time vulnerability scanning across multiple frameworks.'",
        },
      },
      required: ["name", "description", "features"],
    },
};

const createMockIdea = (index: number, theme?: string): Idea => {
    const randomNumber = Math.floor(Math.random() * 1000000);
    const mockName = `Mock Idea ${randomNumber}`;
    return {
        id: crypto.randomUUID(),
        name: mockName,
        description: `This is a mock idea for "${mockName}", generated locally. It's a placeholder to demonstrate the app's functionality without making real API calls. The current theme is "${theme || 'none'}".`,
        features: [
            "Feature A, which is the main reason you'd pay for this.",
            "Feature B, solving a problem you didn't know you had.",
            "Feature C, because our marketing team said we need three.",
        ],
    };
};

export class InvalidApiKeyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidApiKeyError';
    }
}

interface GenerateIdeasOptions {
    parentIdea?: Idea | null;
    likedIdeas?: Idea[];
    theme?: string;
}

export const generateIdeas = async (
    count: number,
    options: GenerateIdeasOptions = {},
    isDevMode: boolean = false
): Promise<Idea[]> => {
    const { parentIdea = null, likedIdeas = [], theme = '' } = options;
    
    if (isDevMode) {
        console.log("Developer Mode: Generating mock ideas instead of calling API.");
        // Simulate network latency for a more realistic feel
        return new Promise(resolve => {
            setTimeout(() => {
                const mockIdeas = Array.from({ length: count }, (_, i) => createMockIdea(Date.now() + i, theme));
                resolve(mockIdeas);
            }, 300);
        });
    }

    if (!process.env.API_KEY) {
        const errorMessage = "API key not provided. Please ensure the API_KEY environment variable is set.";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    let prompt;

    if (theme) {
        if (likedIdeas && likedIdeas.length > 0) {
            const recentLikes = likedIdeas.slice(0, 5).map(idea => `- ${idea.name}: ${idea.description}`).join('\n');
            prompt = `Generate ${count} new SaaS or web app ideas. The ideas must be STRICTLY related to the theme "${theme}". Use the user's previously liked ideas below as inspiration for style and topics within the theme.\n\nLiked Ideas:\n${recentLikes}\n\nDo not include any ideas outside of the specified theme. The ideas should be creative and diverse but stay within the theme's boundaries.`;
        } else {
            prompt = `Generate ${count} diverse and innovative SaaS or web app ideas that are STRICTLY based on the following theme: "${theme}". All ideas must be creative interpretations of the theme, exploring different niches and user problems within that domain. Do not generate any ideas outside of this theme.`;
        }
    } else if (parentIdea) {
        prompt = `Based on the following SaaS idea: {name: "${parentIdea.name}", description: "${parentIdea.description}"}, generate ${count} similar, complementary, or expansive business ideas that build upon the original concept. Ensure the new ideas are distinct but thematically related.`;
    } else if (likedIdeas && likedIdeas.length > 0) {
        const recentLikes = likedIdeas.slice(0, 5).map(idea => `- ${idea.name}: ${idea.description}`).join('\n');
        prompt = `A user has recently liked the following ideas:\n${recentLikes}\n\nBased on these preferences, generate ${count} new SaaS or web app ideas. Create a mix: some ideas should be related to the user's interests, exploring similar themes or industries. However, ensure you also include a few "wildcard" ideas that are completely different and novel to encourage discovery. The goal is a balance between personalization and variety. Focus on unique concepts that solve a clear user need.`;
    } else {
        prompt = `Generate ${count} diverse and innovative SaaS or web app ideas. The ideas should span a wide range of industries such as fintech, e-commerce, developer tools, creator economy, health & wellness, and enterprise software. Focus on unique concepts that solve a clear user need with a modern tech stack. Avoid common or generic ideas like simple to-do list apps or basic nutrition trackers unless you have a very unique angle.`;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 1,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedIdeas = JSON.parse(jsonText);

        if (!Array.isArray(parsedIdeas)) {
            console.error("Gemini API did not return an array:", parsedIdeas);
            return [];
        }

        return parsedIdeas.map((idea: Omit<Idea, 'id'>) => ({
            ...idea,
            id: crypto.randomUUID(),
        }));
    } catch (error) {
        console.error("Error generating ideas with Gemini:", error);
        if (error instanceof Error && error.message.includes("API key not valid")) {
            throw new InvalidApiKeyError("Your API key is not valid. Please select a valid key to continue.");
        }
        throw error; // Re-throw other errors
    }
};