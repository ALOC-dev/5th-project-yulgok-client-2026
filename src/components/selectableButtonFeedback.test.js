import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const componentPaths = [
    new URL('./RadioBtnGroup.jsx', import.meta.url),
    new URL('../pages/Surveys/components/MultipleBtnGroup.jsx', import.meta.url),
];
const checkIconPath = new URL('./SelectionCheckIcon.jsx', import.meta.url);

test('selection buttons use outlined brand styling, a decorative check, and press feedback', async () => {
    for (const componentPath of componentPaths) {
        const source = await readFile(componentPath, 'utf8');

        assert.match(source, /border-brand-primary bg-white text-brand-primary/);
        assert.match(source, /rounded-select border-2/);
        assert.match(source, /<SelectionCheckIcon/);
        assert.doesNotMatch(source, /✓/);
        assert.match(source, /inline-flex[^"]*items-center justify-center gap-1/);
        assert.match(source, /transition-transform/);
        assert.match(source, /active:scale-95/);
        assert.match(source, /aria-pressed=\{isSelected\}/);
        assert.doesNotMatch(source, /bg-brand-primary text-white/);
    }

    const checkIconSource = await readFile(checkIconPath, 'utf8');

    assert.match(checkIconSource, /viewBox="0 0 16 16"/);
    assert.match(checkIconSource, /stroke="currentColor"/);
    assert.match(checkIconSource, /strokeWidth="2"/);
    assert.match(checkIconSource, /strokeLinecap="round"/);
    assert.match(checkIconSource, /strokeLinejoin="round"/);
});

test('multiple selection label shows its configured maximum in secondary text', async () => {
    const source = await readFile(componentPaths[1], 'utf8');

    assert.match(source, /최대 \{maxSelections\}개/);
    assert.match(source, /ml-2 text-xs font-normal text-fg-secondary/);
});
