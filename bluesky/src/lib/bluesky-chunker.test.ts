import { RichText } from '@atproto/api';
import {
  chunkText,
  postThread,
  chunkAndPost,
  PostChunk,
  PostResponse,
  ChunkOptions
} from './bluesky-chunker';

// Simple assertion helpers
function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(a: T, b: T, message: string) {
  if (a !== b) throw new Error(`${message} (expected: ${b}, got: ${a})`);
}

function assertArrayLength(arr: any[], len: number, message: string) {
  if (arr.length !== len) throw new Error(`${message} (expected length: ${len}, got: ${arr.length})`);
}

function assertMatch(str: string, regex: RegExp, message: string) {
  if (!regex.test(str)) throw new Error(`${message} (value: ${str})`);
}

function assertNotMatch(str: string, regex: RegExp, message: string) {
  if (regex.test(str)) throw new Error(`${message} (value: ${str})`);
}

// Mock agent for postThread and chunkAndPost
function createMockAgent(responses: PostResponse[]) {
  let call = 0;
  return {
    post: async () => {
      if (call >= responses.length) throw new Error('Too many calls');
      return responses[call++];
    }
  };
}

// Test runner
type TestResult = { name: string; passed: boolean; error?: string };
const results: TestResult[] = [];

async function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
  } catch (e: any) {
    results.push({ name, passed: false, error: e.message });
  }
}

// Tests
(async () => {
  // chunkText
  await runTest('chunkText returns a single chunk if text fits within maxLength', () => {
    const text = 'Hello, world!';
    const chunks = chunkText(text, { maxLength: 50 });
    assertArrayLength(chunks, 1, 'Should return one chunk');
    assertEqual(chunks[0].text, text, 'Chunk text should match');
    assert(chunks[0].isFirst, 'Chunk should be first');
    assert(chunks[0].isLast, 'Chunk should be last');
    assertEqual(chunks[0].index, 1, 'Chunk index should be 1');
    assertEqual(chunks[0].total, 1, 'Chunk total should be 1');
  });

  await runTest('chunkText splits long text into multiple chunks', () => {
    const text = 'A'.repeat(350);
    const chunks = chunkText(text, { maxLength: 100 });
    assert(chunks.length > 1, 'Should split into multiple chunks');
    assert(chunks[0].isFirst, 'First chunk should be isFirst');
    assert(chunks[chunks.length - 1].isLast, 'Last chunk should be isLast');
    const suffixRegex = / \d+\/\d+$/;
    const totalOriginalLength = chunks.reduce((acc, c) => {
      return acc + c.text.replace(suffixRegex, '').length;
    }, 0);
    assertEqual(totalOriginalLength, 350, 'Total original length should match');
  });

  await runTest('chunkText handles RichText input', () => {
    const richText = new RichText({ text: 'Hello, world!' });
    const chunks = chunkText(richText, { maxLength: 50 });
    assertArrayLength(chunks, 1, 'Should return one chunk');
    assertEqual(chunks[0].richText.text, 'Hello, world!', 'RichText text should match');
  });

  await runTest('chunkText adds thread numbers by default', () => {
    const text = 'A'.repeat(700);
    const chunks = chunkText(text, { maxLength: 300 });
    assert(chunks.length > 1, 'Should split into multiple chunks');
    for (let i = 0; i < chunks.length; i++) {
      assert(
        chunks[i].text.endsWith(` ${i + 1}/${chunks.length}`),
        `Chunk ${i} should end with thread number`
      );
    }
  });

  await runTest('chunkText can disable thread numbers', () => {
    const text = 'A'.repeat(700);
    const chunks = chunkText(text, { maxLength: 300, addThreadNumbers: false });
    for (const chunk of chunks) {
      assertNotMatch(chunk.text, /\d+\/\d+$/, 'Chunk should not have thread number');
    }
  });

  await runTest('chunkText uses custom thread number format', () => {
    const text = 'A'.repeat(700);
    const chunks = chunkText(text, {
      maxLength: 300,
      threadNumberFormat: (cur, tot) => ` [${cur}|${tot}]`
    });
    for (let i = 0; i < chunks.length; i++) {
      assert(
        chunks[i].text.endsWith(` [${i + 1}|${chunks.length}]`),
        `Chunk ${i} should end with custom thread number`
      );
    }
  });

  // postThread
  await runTest('postThread posts a thread of chunks sequentially', async () => {
    const agent = createMockAgent([
      { uri: 'uri1', cid: 'cid1' },
      { uri: 'uri2', cid: 'cid2' }
    ]);
    const chunks: PostChunk[] = [
      {
        richText: new RichText({ text: 'First' }),
        text: 'First',
        isFirst: true,
        isLast: false,
        index: 1,
        total: 2
      },
      {
        richText: new RichText({ text: 'Second' }),
        text: 'Second',
        isFirst: false,
        isLast: true,
        index: 2,
        total: 2
      }
    ];
    const responses = await postThread(agent, chunks);
    assertArrayLength(responses, 2, 'Should return two responses');
    assertEqual(responses[0].uri, 'uri1', 'First response uri');
    assertEqual(responses[1].uri, 'uri2', 'Second response uri');
  });

  // chunkAndPost
  await runTest('chunkAndPost chunks and posts text as a thread', async () => {
    const agent = createMockAgent([
      { uri: 'uri1', cid: 'cid1' },
      { uri: 'uri2', cid: 'cid2' }
    ]);
    const text = 'A'.repeat(350);
    const responses = await chunkAndPost(agent, text, { maxLength: 200 });
    assertArrayLength(responses, 2, 'Should return two responses');
  });

  // Report
  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  for (const r of results) {
    if (r.passed) {
      console.log(`✅ ${r.name}`);
    } else {
      console.log(`❌ ${r.name}: ${r.error}`);
    }
  }
})();