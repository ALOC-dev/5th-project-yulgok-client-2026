import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MainPageLayout from './MainPageLayout.js';

test('renders the shared page bounds, header content, action, and body', () => {
  const html = renderToStaticMarkup(
    createElement(
      MainPageLayout,
      {
        title: '채팅',
        description: '서로 하트를 보낸 유저와 채팅할 수 있어요.',
        headerAction: createElement('button', { type: 'button' }, '실행'),
      },
      createElement('div', null, '본문'),
    ),
  );

  assert.match(html, /max-w-\[600px\]/);
  assert.match(html, /px-5/);
  assert.match(html, /pt-\[clamp\(1rem,4vw,2rem\)\]/);
  assert.match(html, />채팅</);
  assert.match(html, />서로 하트를 보낸 유저와 채팅할 수 있어요\.</);
  assert.match(html, />실행</);
  assert.match(html, />본문</);
});
