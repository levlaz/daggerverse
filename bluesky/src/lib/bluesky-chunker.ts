// src/lib/bluesky-chunker.ts
import { RichText } from '@atproto/api';

export interface ChunkOptions {
  /** Maximum character length per chunk (default: 300) */
  maxLength?: number;
  /** Whether to add thread numbers like "1/3" (default: true) */
  addThreadNumbers?: boolean;
  /** Custom format function for thread numbers */
  threadNumberFormat?: (current: number, total: number) => string;
}

export interface PostChunk {
  /** The RichText content for this chunk */
  richText: RichText;
  /** The plain text content for this chunk */
  text: string;
  /** Whether this is the first chunk in the thread */
  isFirst: boolean;
  /** Whether this is the last chunk in the thread */
  isLast: boolean;
  /** 1-based index of this chunk */
  index: number;
  /** Total number of chunks */
  total: number;
}

export interface PostResponse {
  uri: string;
  cid: string;
}

// Constants
const DEFAULT_BLUESKY_CHAR_LIMIT = 300;
const DEFAULT_THREAD_NUMBER_RESERVE = 8;

const BREAK_POINT_PRIORITY = {
  SENTENCE_END: ['.', '!', '?'],
  CLAUSE_BREAK: [',', ';', ':'],
  CLOSING_BRACKETS: [')', ']', '}'],
  WHITESPACE: [' ', '\n', '\t']
} as const;

/**
 * Chunks a RichText or string into multiple posts suitable for Bluesky threading
 * @param input RichText object or plain string to chunk
 * @param options Configuration options for chunking
 * @returns Array of post chunks with RichText and metadata
 */
export function chunkText(
  input: RichText | string,
  options: ChunkOptions = {}
): PostChunk[] {
  const {
    maxLength = DEFAULT_BLUESKY_CHAR_LIMIT,
    addThreadNumbers = true,
    threadNumberFormat = (current, total) => ` ${current}/${total}`
  } = options;

  // Convert string to RichText if needed
  const richText = typeof input === 'string' ? new RichText({ text: input }) : input;
  
  // Detect facets (mentions, links, etc.)
  if (typeof input === 'string') {
    richText.detectFacets();
  }

  // Check if the text fits in one post (accounting for byte length)
  if (getTextByteLength(richText.text) <= maxLength) {
    return [{
      richText,
      text: richText.text,
      isFirst: true,
      isLast: true,
      index: 1,
      total: 1
    }];
  }

  const chunks = createRichTextChunks(richText, maxLength, addThreadNumbers);
  return addThreadNumbers ? 
    addThreadNumbersToChunks(chunks, threadNumberFormat, maxLength) :
    chunks.map((chunk, index) => createPostChunk(chunk, index, chunks.length));
}

/**
 * Get the byte length of text (Bluesky counts bytes, not characters)
 */
function getTextByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

/**
 * Split RichText into chunks while preserving facets
 */
function createRichTextChunks(
  richText: RichText,
  maxLength: number,
  reserveSpaceForNumbers: boolean
): RichText[] {
  const chunks: RichText[] = [];
  const originalText = richText.text;
  const facets = richText.facets || [];
  
  const effectiveMaxLength = reserveSpaceForNumbers ? 
    maxLength - DEFAULT_THREAD_NUMBER_RESERVE : 
    maxLength;

  let currentPosition = 0;

  while (currentPosition < originalText.length) {
    const remainingText = originalText.substring(currentPosition);
    
    if (getTextByteLength(remainingText) <= effectiveMaxLength) {
      // Remaining text fits in one chunk
      const chunkText = remainingText;
      const chunkFacets = getFacetsForRange(facets, currentPosition, originalText.length);
      const adjustedFacets = adjustFacetsForNewPosition(chunkFacets, currentPosition);
      
      const chunkRichText = new RichText({ 
        text: chunkText,
        facets: adjustedFacets 
      });
      
      chunks.push(chunkRichText);
      break;
    }

    // Find optimal split point
    const splitPoint = findOptimalSplitPointForRichText(
      originalText, 
      currentPosition, 
      effectiveMaxLength,
      facets
    );

    const chunkText = originalText.substring(currentPosition, splitPoint).trim();
    const chunkFacets = getFacetsForRange(facets, currentPosition, splitPoint);
    const adjustedFacets = adjustFacetsForNewPosition(chunkFacets, currentPosition);

    const chunkRichText = new RichText({ 
      text: chunkText,
      facets: adjustedFacets 
    });

    chunks.push(chunkRichText);
    
    // Skip whitespace at the beginning of the next chunk
    currentPosition = splitPoint;
    while (currentPosition < originalText.length && 
           /\s/.test(originalText[currentPosition])) {
      currentPosition++;
    }
  }

  return chunks;
}

/**
 * Find optimal split point while avoiding breaking facets (mentions, links)
 */
function findOptimalSplitPointForRichText(
  text: string,
  startPos: number,
  maxLength: number,
  facets: any[]
): number {
  let targetEnd = startPos + maxLength;
  
  // Don't exceed text length
  if (targetEnd >= text.length) {
    return text.length;
  }

  // Find the actual byte-based limit
  let actualEnd = startPos;
  let byteCount = 0;
  
  for (let i = startPos; i < text.length && byteCount < maxLength; i++) {
    const char = text[i];
    const charByteLength = getTextByteLength(char);
    
    if (byteCount + charByteLength > maxLength) {
      break;
    }
    
    byteCount += charByteLength;
    actualEnd = i + 1;
  }

  // Check if we're breaking a facet
  const conflictingFacet = facets.find(facet => 
    facet.index.byteStart < actualEnd && 
    facet.index.byteEnd > actualEnd
  );

  if (conflictingFacet) {
    // Move split point before the facet
    actualEnd = Math.min(actualEnd, conflictingFacet.index.byteStart);
  }

  // Look backwards for optimal break points
  let splitIndex = actualEnd;
  
  while (splitIndex > startPos) {
    const char = text[splitIndex - 1];
    
    if (BREAK_POINT_PRIORITY.WHITESPACE.includes(char)) {
      return splitIndex;
    }
    
    if (BREAK_POINT_PRIORITY.SENTENCE_END.includes(char)) {
      return splitIndex;
    }
    
    if (BREAK_POINT_PRIORITY.CLAUSE_BREAK.includes(char)) {
      return splitIndex;
    }
    
    if (BREAK_POINT_PRIORITY.CLOSING_BRACKETS.includes(char)) {
      return splitIndex;
    }
    
    splitIndex--;
  }

  // Fallback: find last space
  const lastSpace = text.lastIndexOf(' ', actualEnd);
  return lastSpace > startPos ? lastSpace : actualEnd;
}

/**
 * Get facets that fall within a specific range
 */
function getFacetsForRange(facets: any[], start: number, end: number): any[] {
  return facets.filter(facet => 
    facet.index.byteStart >= start && facet.index.byteEnd <= end
  );
}

/**
 * Adjust facet positions for a new text chunk
 */
function adjustFacetsForNewPosition(facets: any[], offset: number): any[] {
  return facets.map(facet => ({
    ...facet,
    index: {
      ...facet.index,
      byteStart: facet.index.byteStart - offset,
      byteEnd: facet.index.byteEnd - offset
    }
  }));
}

function addThreadNumbersToChunks(
  chunks: RichText[],
  threadNumberFormat: (current: number, total: number) => string,
  maxLength: number
): PostChunk[] {
  const totalChunks = chunks.length;
  
  return chunks.map((chunk, index) => {
    const threadNumber = threadNumberFormat(index + 1, totalChunks);
    
    // Create new RichText with thread number appended
    const newText = chunk.text + threadNumber;
    const newRichText = new RichText({ 
      text: newText,
      facets: chunk.facets 
    });
    
    // Handle overflow by truncating if necessary
    if (getTextByteLength(newText) > maxLength) {
      const availableBytes = maxLength - getTextByteLength(threadNumber);
      const truncatedText = truncateTextToByteLength(chunk.text, availableBytes);
      const finalText = truncatedText + threadNumber;
      
      // Adjust facets for truncated text
      const truncatedFacets = chunk.facets?.filter(facet => 
        facet.index.byteEnd <= getTextByteLength(truncatedText)
      ) || [];
      
      newRichText.text = finalText;
      newRichText.facets = truncatedFacets;
    }

    return createPostChunk(newRichText, index, totalChunks);
  });
}

/**
 * Truncate text to fit within byte limit while preserving words
 */
function truncateTextToByteLength(text: string, maxBytes: number): string {
  if (getTextByteLength(text) <= maxBytes) return text;
  
  let truncated = text;
  while (getTextByteLength(truncated) > maxBytes) {
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace === -1) {
      // No spaces, truncate character by character
      truncated = truncated.slice(0, -1);
    } else {
      truncated = truncated.substring(0, lastSpace).trim();
    }
  }
  
  return truncated;
}

function createPostChunk(richText: RichText, index: number, total: number): PostChunk {
  return {
    richText,
    text: richText.text,
    isFirst: index === 0,
    isLast: index === total - 1,
    index: index + 1,
    total
  };
}

/**
 * Posts a thread of chunks to Bluesky
 * @param agent Authenticated Bluesky agent
 * @param chunks Array of post chunks to thread together
 * @returns Array of post responses
 */
export async function postThread(
  agent: any, // BskyAgent from @atproto/api
  chunks: PostChunk[]
): Promise<PostResponse[]> {
  const posts: PostResponse[] = [];
  
  for (const chunk of chunks) {
    const postRecord = {
      text: chunk.richText.text,
      facets: chunk.richText.facets,
      createdAt: new Date().toISOString()
    };

    if (chunk.isFirst) {
      const post = await agent.post(postRecord);
      posts.push(post);
    } else {
      const rootPost = posts[0];
      const parentPost = posts[posts.length - 1];
      
      const post = await agent.post({
        ...postRecord,
        reply: {
          root: { uri: rootPost.uri, cid: rootPost.cid },
          parent: { uri: parentPost.uri, cid: parentPost.cid }
        }
      });
      posts.push(post);
    }
  }
  
  return posts;
}

/**
 * Convenience function to chunk text and post as thread in one call
 * @param agent Authenticated Bluesky agent
 * @param input RichText or string to chunk and post
 * @param options Chunking options
 * @returns Array of post responses
 */
export async function chunkAndPost(
  agent: any, // BskyAgent from @atproto/api
  input: RichText | string,
  options?: ChunkOptions
): Promise<PostResponse[]> {
  const chunks = chunkText(input, options);
  return postThread(agent, chunks);
}
