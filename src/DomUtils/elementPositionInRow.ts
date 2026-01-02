import { DEFAULT_LABEL_HEIGHT } from '../components/main/PickerMain';

import { ClassNames, asSelectors } from './classNames';
import { NullableElement } from './selectors';

function isElementVisuallyRotated(el: NullableElement) {
  let node = el;
  let matrix = new DOMMatrix();

  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node);
    const transform = style.transform;

    if (transform && transform !== 'none') {
      matrix = new DOMMatrix(transform).multiply(matrix);
    }

    node = node.parentElement;
  }

  // matrix.b 或 matrix.c 非 0，说明坐标轴被旋转 / skew
  return Math.abs(matrix.b) > 1e-6 || Math.abs(matrix.c) > 1e-6;
}


export function elementCountInRow(
  parent: NullableElement,
  element: NullableElement
): number {
  if (!parent || !element) {
    return 0;
  }
  const rotated = isElementVisuallyRotated(parent);

  const parentSize = rotated ? parent.getBoundingClientRect().height : parent.getBoundingClientRect().width;
  const elementSize = rotated ? parent.getBoundingClientRect().height : element.getBoundingClientRect().width;
  return Math.floor(parentSize / elementSize);
}

export function firstVisibleElementInContainer(
  parent: NullableElement,
  elements: HTMLElement[],
  maxVisibilityDiffThreshold = 0
): NullableElement {
  if (!parent || !elements.length) {
    return null;
  }
  const rotated = isElementVisuallyRotated(parent);

  const parentStart = rotated ? parent.getBoundingClientRect().left : parent.getBoundingClientRect().top;
  const parentEnd = rotated ? parent.getBoundingClientRect().right : parent.getBoundingClientRect().bottom;
  const parentStartWithLabel = parentStart + getLabelHeight(parent);

  const visibleElements = elements.find(element => {
    const elementStart = rotated ? element.getBoundingClientRect().left : element.getBoundingClientRect().top;
    const elementEnd = rotated ? element.getBoundingClientRect().right : element.getBoundingClientRect().bottom;
    const maxVisibilityDiffPixels =
      element.clientHeight * maxVisibilityDiffThreshold;

    const elementTopWithAllowedDiff = elementStart + maxVisibilityDiffPixels;
    const elementBottomWithAllowedDiff =
      elementEnd - maxVisibilityDiffPixels;

    if (elementTopWithAllowedDiff < parentStartWithLabel) {
      return false;
    }

    return (
      (elementTopWithAllowedDiff >= parentStart &&
        elementTopWithAllowedDiff <= parentEnd) ||
      (elementBottomWithAllowedDiff >= parentStart &&
        elementBottomWithAllowedDiff <= parentEnd)
    );
  });

  return visibleElements || null;
}

export function hasNextElementSibling(element: HTMLElement) {
  return !!element.nextElementSibling;
}

export function getLabelHeight(parentNode: NullableElement) {
  if (!parentNode) {
    return DEFAULT_LABEL_HEIGHT;
  }
  const rotated = isElementVisuallyRotated(parentNode);

  const label = parentNode.querySelector(asSelectors(ClassNames.label));

  if (label) {
    const height = rotated ? label.getBoundingClientRect().width : label.getBoundingClientRect().height;
    if (height > 0) {
      return height;
    }
  }

  // fallback to default
  return DEFAULT_LABEL_HEIGHT;
}
