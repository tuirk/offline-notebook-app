import { generateRAGResponse } from './ragUtils';

/**
 * This file contains utility functions for AI processing in the application.
 * In a real implementation, you would connect to an actual offline AI model.
 * For this demo, we'll use simplified mock implementations.
 */

// Simple text chunking for processing large documents
export const chunkText = (text: string, chunkSize = 1000): string[] => {
  const chunks: string[] = [];
  let i = 0;
  
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize;
  }
  
  return chunks;
};

// Mock function to analyze document content
export const analyzeDocument = async (text: string): Promise<string> => {
  // In a real implementation, this would use an actual AI model
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`This document appears to be about ${generateMockTopic(text)}. It contains approximately ${text.split(' ').length} words.`);
    }, 1000);
  });
};

// Modified function to generate an AI response to a user query
export const generateAIResponse = async (documentText: string, userQuery: string): Promise<string> => {
  try {
    // Use RAG-based response if possible
    if (window.navigator.onLine && document.visibilityState === 'visible') {
      try {
        // Try to use RAG model first
        return await generateRAGResponse(documentText, userQuery);
      } catch (error) {
        console.warn("RAG model failed, falling back to mock responses:", error);
        // Fall back to mock responses if RAG fails
      }
    }
    
    // Fall back to mock responses
    return new Promise((resolve) => {
      setTimeout(() => {
        if (userQuery.toLowerCase().includes('summary')) {
          resolve(generateMockSummary(documentText));
        } else if (userQuery.toLowerCase().includes('key points')) {
          resolve(generateMockKeyPoints(documentText));
        } else if (userQuery.toLowerCase().includes('recommend') || userQuery.toLowerCase().includes('suggestion')) {
          resolve(generateMockRecommendations(documentText));
        } else {
          resolve(generateMockResponse(documentText, userQuery));
        }
      }, 1500);
    });
  } catch (error) {
    console.error("Error in AI response generation:", error);
    return "I'm sorry, I encountered an error while generating a response.";
  }
};

// Mock function to extract key terms from document content
export const extractKeyTerms = async (text: string): Promise<string[]> => {
  // In a real implementation, this would use an actual AI model
  return new Promise((resolve) => {
    setTimeout(() => {
      const words = text.split(' ');
      const uniqueWords = Array.from(new Set(words.filter(w => w.length > 5)));
      const sampleTerms = uniqueWords
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(10, uniqueWords.length));
      
      resolve(sampleTerms);
    }, 800);
  });
};

// Helper functions for generating mock responses
const generateMockTopic = (text: string): string => {
  const topics = [
    'business strategy', 
    'technology trends', 
    'scientific research', 
    'market analysis', 
    'product development',
    'artificial intelligence',
    'data science',
    'project management',
    'financial analysis'
  ];
  
  // Use some heuristic based on the text to pick a topic
  const index = Math.abs(text.length) % topics.length;
  return topics[index];
};

const generateMockSummary = (text: string): string => {
  return `
This document discusses ${generateMockTopic(text)} with a focus on implementation strategies and best practices.

The author presents several key arguments about the importance of structured approaches to problem-solving and data-driven decision making. There's significant emphasis on methodologies that can be applied across different domains.

The document is structured in multiple sections, beginning with an introduction to core concepts, followed by detailed analysis, and concluding with practical recommendations.
  `;
};

const generateMockKeyPoints = (text: string): string => {
  return `
Here are the key points from this document:

1. The primary focus is on ${generateMockTopic(text)}
2. Several methodologies are introduced for practical implementation
3. Data-driven approaches are emphasized throughout
4. The author recommends an iterative process for best results
5. Case studies are provided to illustrate practical applications
6. Potential challenges and limitations are acknowledged
7. Future directions for research are suggested in the conclusion
  `;
};

const generateMockRecommendations = (text: string): string => {
  return `
Based on this document, I would recommend:

1. Begin by implementing the core framework described in section 2
2. Focus on collecting relevant data before proceeding to analysis
3. Use the iterative approach outlined for continuous improvement
4. Consider the contextual factors discussed when adapting the methodology
5. Pay special attention to the potential limitations identified
  `;
};

const generateMockResponse = (documentText: string, userQuery: string): string => {
  return `
Based on the document content, I can provide this response to your question about "${userQuery}":

The document addresses this topic primarily in the context of ${generateMockTopic(documentText)}. The author suggests that ${userQuery.toLowerCase().includes('how') ? 'the process involves multiple steps including data collection, analysis, and implementation' : 'this concept is central to understanding the overall framework'}.

There are several relevant points made throughout the document that relate to your question, particularly regarding best practices and implementation strategies.
  `;
};
