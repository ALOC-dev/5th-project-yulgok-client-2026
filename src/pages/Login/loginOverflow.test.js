import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('clips the offscreen school watermark without horizontal page scrolling', async () => {
    const login = await readFile(new URL('./Login.jsx', import.meta.url), 'utf8');

    assert.match(login, /<main className="[^"]*overflow-x-hidden[^"]*"/);
    assert.match(login, /src="\/uos_logo\.svg"[^>]*right-\[-80px\]/);
});
