import { prepareWithSegments, measureLineStats, measureNaturalWidth } from './vendor/pretext/layout.js';

// Grow text regions without shrinking user-selected type sizes.
export async function sizeTextRegions(root) {
  await document.fonts.ready;
  const regions = [...root.querySelectorAll('h1, h2, h3, p, #progress, #feedback, button')];
  const cache = new WeakMap();
  let scheduled = false;
  function measure() {
    scheduled = false;
    const updates = [];
    for (const element of regions) {
      if (!element.getClientRects().length) continue;
      const style = getComputedStyle(element);
      const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const spacing = parseFloat(style.letterSpacing) || 0;
      const key = `${font}|${spacing}|${element.textContent}`;
      let saved = cache.get(element);
      try {
        if (saved?.key !== key) {
          saved = { key, prepared: prepareWithSegments(element.textContent, font, { letterSpacing: spacing }) };
          cache.set(element, saved);
        }
        const horizontal = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const vertical = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        const horizontalBorder = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
        const width = Math.max(1, element.getBoundingClientRect().width - horizontal - horizontalBorder);
        const stats = measureLineStats(saved.prepared, width);
        const lineHeight = parseFloat(style.lineHeight);
        const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        const height = Math.max(element.tagName === 'BUTTON' ? 44 : 0,
          Math.ceil(Math.max(1, stats.lineCount) * lineHeight + vertical + border));
        const naturalWidth = measureNaturalWidth(saved.prepared);
        const preferredWidth = Math.ceil(naturalWidth + horizontal + horizontalBorder + 3);
        const availableWidth = element.parentElement.clientWidth;
        updates.push(() => {
          element.dataset.textFit = stats.maxLineWidth <= width + 1 ? 'fit' : 'reflow';
          element.dataset.textLines = String(stats.lineCount);
          element.dataset.textNaturalWidth = String(Math.ceil(naturalWidth));
          if (element.matches('button, #progress, .subtitle') && !element.closest('.quiz')) {
            const minWidth = `${Math.min(preferredWidth, availableWidth)}px`;
            if (element.style.minWidth !== minWidth) element.style.minWidth = minWidth;
          }
          if (element.style.minHeight !== `${height}px`) element.style.minHeight = `${height}px`;
        });
      } catch {
        updates.push(() => { element.dataset.textFit = 'unavailable'; });
      }
    }
    for (const update of updates) update();
    const quiz = root.querySelector('.quiz');
    if (quiz && !quiz.hidden && matchMedia('(max-width: 680px)').matches) {
      const quizStyle = getComputedStyle(quiz);
      const gap = parseFloat(quizStyle.columnGap) || 0;
      const padding = (parseFloat(quizStyle.paddingLeft) || 0) + (parseFloat(quizStyle.paddingRight) || 0);
      const buttons = [...quiz.querySelectorAll('button:not([hidden]):not(#answer-block)')];
      const tooWide = buttons.some((button) => {
        const style = getComputedStyle(button);
        const insets = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0) +
          (parseFloat(style.borderLeftWidth) || 0) + (parseFloat(style.borderRightWidth) || 0);
        const halfWidth = (quiz.clientWidth - padding - gap) / 2 - insets - 4;
        const prepared = cache.get(button)?.prepared;
        return prepared && measureNaturalWidth(prepared) > halfWidth;
      });
      quiz.dataset.stacked = String(tooWide);
    }
  }
  const schedule = () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(measure); }
  };
  new ResizeObserver(schedule).observe(root);
  new MutationObserver(schedule).observe(root, {
    subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden'],
  });
  measure();
}
