const MARGIN = 8;

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

export function computeFixedMenuPosition({
  anchorTop,
  anchorLeft,
  menuWidth,
  menuHeight,
}) {
  const { innerWidth, innerHeight } = window;

  const fitsBelow = anchorTop + MARGIN + menuHeight <= innerHeight - MARGIN;
  const top = fitsBelow
    ? anchorTop + MARGIN
    : Math.max(MARGIN, anchorTop - menuHeight - MARGIN);

  const left = clamp(anchorLeft, MARGIN, innerWidth - menuWidth - MARGIN);

  return { top, left };
}