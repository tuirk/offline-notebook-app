
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
    console.log("Processing document with length:", documentText.length);
    
    if (!documentText || documentText.length === 0) {
      console.error("Empty document text received");
      throw new Error("Cannot process empty document");
    }
    
    await this.initialize();
    
    // Clear previous chunks
    this.documentChunks = [];
    
    // Split document into chunks
    const chunks = this.splitIntoChunks(documentText);
    console.log(`Split document into ${chunks.length} chunks`);
    
    // Generate embeddings for each chunk
    for (const chunk of chunks) {
      try {
        if (chunk.trim().length === 0) continue;
        
        const result = await this.embeddingModel(chunk, { 
          pooling: "mean", 
          normalize: true 
        });
        
        // Extract embedding data from the tensor
        // First, check if it's directly accessible via .data
        let embeddingData: number[] = [];
        
        if (result && result.data) {
          console.log("Embedding result type:", typeof result.data);
          
          // Check for different tensor formats and extract accordingly
          if (result.data.tolist) {
            // Direct tensor with tolist method
            embeddingData = result.data.tolist();
            console.log("Using tolist() method to extract embedding data");
          } else if (Array.isArray(result.data)) {
            // Already an array, convert to numbers
            embeddingData = result.data.map((val: any) => Number(val));
            console.log("Converting array-like data to number array");
          } else if (result.data.values) {
            // TypedArray with values
            embeddingData = Array.from(result.data.values());
            console.log("Converting TypedArray values to number array");
          } else if (result.tolist) {
            // Direct tensor on the result object itself
            embeddingData = result.tolist();
            console.log("Using top-level tolist() method");
          } else {
            // Last resort - try to convert whatever we have
            embeddingData = Array.from(result.data);
            console.log("Using Array.from on result.data as fallback");
          }
        }
        
        // Validate embedding data
        if (embeddingData.length === 0) {
          console.error("Failed to extract embedding data", result);
          continue;
        }
        
        // Debugging: log first few values of embedding
        console.log("Embedding data sample:", embeddingData.slice(0, 5));
        
        this.documentChunks.push({
          text: chunk,
          embedding: embeddingData
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
      console.error("No document chunks available");
      throw new Error("No document chunks available. Process a document first.");
    }
    
    console.log(`Finding relevant chunks for query: "${query}"`);
    
    // Generate embedding for the query
    const queryResult = await this.embeddingModel(query, { 
      pooling: "mean", 
      normalize: true 
    });
    
    // Extract query vector using the same approach as in processDocument
    let queryVector: number[] = [];
    
    if (queryResult && queryResult.data) {
      if (queryResult.data.tolist) {
        queryVector = queryResult.data.tolist();
      } else if (Array.isArray(queryResult.data)) {
        queryVector = queryResult.data.map((val: any) => Number(val));
      } else if (queryResult.data.values) {
        queryVector = Array.from(queryResult.data.values());
      } else if (queryResult.tolist) {
        queryVector = queryResult.tolist();
      } else {
        queryVector = Array.from(queryResult.data);
      }
    }
    
    // Validate query vector
    if (queryVector.length === 0) {
      console.error("Failed to generate query embedding", queryResult);
      return [];
    }
    
    console.log("Query vector sample:", queryVector.slice(0, 5));
    
    // Calculate similarity scores
    const similarities = this.documentChunks.map((chunk, index) => {
      // Validate chunk embedding
      if (!chunk.embedding || chunk.embedding.length === 0) {
        console.error("Invalid embedding for chunk at index", index);
        return { index, score: -1 };
      }
      
      if (queryVector.length !== chunk.embedding.length) {
        console.error(
          `Vector dimension mismatch: query=${queryVector.length}, chunk=${chunk.embedding.length}`
        );
        return { index, score: -1 };
      }
      
      return {
        index,
        score: this.cosineSimilarity(queryVector, chunk.embedding)
      };
    });
    
    // Filter out invalid scores and sort by similarity (descending)
    const validSimilarities = similarities
      .filter(sim => sim.score >= 0)
      .sort((a, b) => b.score - a.score);
    
    console.log(`Found ${validSimilarities.length} valid similarities`);
    
    // Return the top K most relevant chunks
    const results = validSimilarities
      .slice(0, topK)
      .map(sim => this.documentChunks[sim.index].text);
    
    console.log(`Returning ${results.length} relevant chunks`);
    return results;
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
    
    if (normA === 0 || normB === 0) {
      console.warn("Zero magnitude vector detected in similarity calculation");
      return 0;
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
      console.log("Generating response with context length:", context.length);
      
      // Prepare prompt with context and query
      const prompt = `Context: ${context}\n\nQuestion: ${query}\n\nAnswer:`;
      
      // Generate response
      const result = await this.generationModel(prompt, {
        max_new_tokens: 100,
        do_sample: true,
        temperature: 0.7
      });
      
      let response = "";
      if (Array.isArray(result) && result.length > 0) {
        response = result[0].generated_text || "";
      } else {
        console.error("Unexpected result format from text generation model:", result);
        return "I'm sorry, I encountered an unexpected response format.";
      }
      
      // Extract only the answer part
      const answerPart = response.split("Answer:").pop();
      if (answerPart) {
        response = answerPart.trim();
      }
      
      return response || "I'm sorry, I couldn't generate a meaningful response.";
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
  console.log("Starting RAG response generation for query:", userQuery);
  
  try {
    // Check if document is available
    if (!documentText || documentText.length === 0) {
      return "I need document content to answer your question. Please upload a document first.";
    }
    
    // Process the document
    if (!documentEmbedder.isInitialized()) {
      console.log("Processing document for the first time");
      await documentEmbedder.processDocument(documentText);
    }
    
    // Retrieve relevant chunks
    console.log("Finding relevant chunks for query");
    const relevantChunks = await documentEmbedder.findRelevantChunks(userQuery);
    
    if (relevantChunks.length === 0) {
      return "I couldn't find relevant information in the document to answer your question.";
    }
    
    // Join relevant chunks as context
    const context = relevantChunks.join("\n\n");
    console.log("Retrieved context length:", context.length);
    
    // Generate response based on retrieved context
    console.log("Generating final response");
    const response = await textGenerator.generateResponse(context, userQuery);
    
    console.log("RAG response generation completed");
    return response;
  } catch (error) {
    console.error("Error in RAG response generation:", error);
    return "I'm sorry, I couldn't generate a response based on the document content. Technical error occurred.";
  }
}

