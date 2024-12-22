import { RestEvent } from "kiss-ai-stack-client";


interface ChatAnswer {
    answer: string;
}

class ChatService {
    private client: RestEvent;
    private stackId: string | null = null;

    constructor(baseUrl: string, secure: false) {
        this.client = new RestEvent(baseUrl, secure);
    }

    async authorizeStack(secret?: string, userId?: string, mode?: string) {
        try {
            await this.client.authorizeStack(secret, userId, mode);
        } catch (error) {
            console.error('Error authorizing stack:', error);
            throw error;
        }
    }

    async bootstrapStack(message: string) {
        try {
            await this.client.bootstrapStack('Greetings!');
        } catch (error) {
            console.error('Error bootstrapping stack:', error);
            throw error;
        }
    }

    async generateAnswer(question: string): Promise<ChatAnswer | undefined> {
        try {
            const response = await this.client.generateAnswer(question);
            if (response?.result) {
                return {answer: response.result}
            }
        } catch (error) {
            console.error('Error generating answer:', error);
            throw error;
        }
        return undefined
    }

    async destroyStack(message: string) {
        try {
            await this.client.destroyStack("Bye");
        } catch (error) {
            console.error('Error destroying stack:', error);
            throw error;
        } finally {
            this.stackId = null
        }
    }
}

export default ChatService;
