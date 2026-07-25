import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pagePaths = [
  '../pages/Matching/Matching.jsx',
  '../pages/Chat/Chat.jsx',
  '../pages/MyPage/MyPage.jsx',
];

test('matching, chat, and my pages use the shared page layout', async () => {
  const pages = await Promise.all(
    pagePaths.map((path) => readFile(new URL(path, import.meta.url), 'utf8')),
  );

  for (const page of pages) {
    assert.match(page, /import MainPageLayout from ['"]\.\.\/\.\.\/layout\/MainPageLayout\.js['"]/);
    assert.match(page, /<MainPageLayout\b/);
  }
});

test('matching keeps its dynamic description and header action in the shared header', async () => {
  const matching = await readFile(new URL('../pages/Matching/Matching.jsx', import.meta.url), 'utf8');

  assert.match(matching, /description=\{executeError \|\| executeMessage/);
  assert.match(matching, /headerAction=\{<ExeMatchBtn/);
  assert.match(matching, /descriptionClassName=\{/);
});
