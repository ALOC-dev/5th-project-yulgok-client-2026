import { createElement } from 'react';

function MainPageLayout({
  title,
  description,
  headerAction,
  children,
  className = '',
  descriptionClassName = '',
  descriptionTitle,
}) {
  return createElement(
    'section',
    {
      className: `mx-auto flex min-h-[calc(100dvh-96px)] w-full min-w-0 max-w-[600px] flex-col px-5 pb-10 pt-[clamp(1rem,4vw,2rem)] ${className}`.trim(),
    },
    createElement(
      'header',
      { className: 'flex min-w-0 items-center justify-between gap-4' },
      createElement(
        'div',
        { className: 'flex min-w-0 flex-col gap-1' },
        createElement(
          'h1',
          { className: 'font-heading text-xl font-extrabold text-fg-primary' },
          title,
        ),
        description
          ? createElement(
              'p',
              {
                className: `text-[13px] font-medium text-fg-basic-muted ${descriptionClassName}`.trim(),
                title: descriptionTitle,
              },
              description,
            )
          : null,
      ),
      headerAction || null,
    ),
    children,
  );
}

export default MainPageLayout;
