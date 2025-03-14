
import { pipeline, env } from "@huggingface/transformers";

// Set the location for model downloads
env.localModelPath = "./hf-models";

// Class to handle document embeddings and similarity search
export class DocumentEmbedder {
  private embeddingModel: any = null;
  private documentChunks: { text: string; embedding: number[] }[] = [];
  private isLoading: boolean = false;

  constructor() {
    // Initialize will be called on demand
  }

  async initialize() {
    if (this.embeddingModel !== null) return;
    
    this.isLoading = true;
    try {
      // Load a small embedding model suitable for browser use
      this.embeddingModel = await pipeline(
        "feature-extraction",
        "mixedbread-ai/mxbai-embed-xsmall-v1"
      );
      
      console.log("Embedding model loaded successfully");
    } catch (error) {
      console.error("Error loading embedding model:", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  // Split text into chunks for processing
  splitIntoChunks(text: string, chunkSize: number = 300): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }
    
    return chunks;
  }

  // Process a document and create embeddings
  async processDocument(documentText: string): Promise<void> {
    await this.initialize();
    
    // Clear previous chunks
    this.documentChunks = [];
    
    // Split document into chunks
    const chunks = this.splitIntoChunks(documentText);
    
    // Generate embeddings for each chunk
    for (const chunk of chunks) {
      try {
        const embedding = await this.embeddingModel(chunk, { 
          pooling: "mean", 
          normalize: true 
        });
        
        this.documentChunks.push({
          text: chunk,
          embedding: embedding.tolist()[0] // Get the first (and only) embedding
        });
      } catch (error) {
        console.error("Error generating embedding for chunk:", error);
      }
    }
    
    console.log(`Processed ${this.documentChunks.length} chunks with embeddings`);
  }

  // Find the most relevant chunks for a query
  async findRelevantChunks(query: string, topK: number = 3): Promise<string[]> {
    if (this.documentChunks.length === 0) {
      throw new Error("No document chunks available. Process a document first.");
    }
    
    // Generate embedding for the query
    const queryEmbedding = await this.embeddingModel(query, { 
      pooling: "mean", 
      normalize: true 
    });
    
    const queryVector = queryEmbedding.tolist()[0];
    
    // Calculate similarity scores
    const similarities = this.documentChunks.map((chunk, index) => ({
      index,
      score: this.cosineSimilarity(queryVector, chunk.embedding)
    }));
    
    // Sort by similarity score (descending)
    similarities.sort((a, b) => b.score - a.score);
    
    // Return the top K most relevant chunks
    return similarities.slice(0, topK).map(sim => this.documentChunks[sim.index].text);
  }
  
  // Calculate cosine similarity between two vectors
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error("Vectors must have the same dimensions");
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  isInitialized(): boolean {
    return this.embeddingModel !== null;
  }
  
  isInitializing(): boolean {
    return this.isLoading;
  }
}

// TextGenerator class for local text generation
export class TextGenerator {
  private generationModel: any = null;
  private isLoading: boolean = false;

  constructor() {
    // Initialize will be called on demand
  }

  async initialize() {
    if (this.generationModel !== null) return;
    
    this.isLoading = true;
    try {
      // Load a small text generation model
      this.generationModel = await pipeline(
        "text-generation",
        "onnx-community/tiny-random-gpt2"
      );
      
      console.log("Text generation model loaded successfully");
    } catch (error) {
      console.error("Error loading text generation model:", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async generateResponse(context: string, query: string): Promise<string> {
    await this.initialize();
    
    try {
      // Prepare prompt with context and query
      const prompt = `Context: ${context}\n\nQuestion: ${query}\n\nAnswer:`;
      
      // Generate response
      const result = await this.generationModel(prompt, {
        max_new_tokens: 100,
        do_sample: true,
        temperature: 0.7
      });
      
      let response = result[0].generated_text;
      
      // Extract only the answer part
      response = response.split("Answer:").pop() || response;
      
      return response.trim();
    } catch (error) {
      console.error("Error generating response:", error);
      return "I'm sorry, I encountered an error while generating a response.";
    }
  }
  
  isInitialized(): boolean {
    return this.generationModel !== null;
  }
  
  isInitializing(): boolean {
    return this.isLoading;
  }
}

// Global instances (singleton pattern)
export const documentEmbedder = new DocumentEmbedder();
export const textGenerator = new TextGenerator();

// Main function for RAG-based response generation
export async function generateRAGResponse(documentText: string, userQuery: string): Promise<string> {
  try {
    // Process the document if needed
    if (documentEmbedder.isInitialized() === false) {
      await documentEmbedder.processDocument(documentText);
    }
    
    // Retrieve relevant chunks
    const relevantChunks = await documentEmbedder.findRelevantChunks(userQuery);
    
    // Join relevant chunks as context
    const context = relevantChunks.join("\n\n");
    
    // Generate response based on retrieved context
    const response = await textGenerator.generateResponse(context, userQuery);
    
    return response;
  } catch (error) {
    console.error("Error in RAG response generation:", error);
    return "I'm sorry, I couldn't generate a response based on the document content.";
  }
}
