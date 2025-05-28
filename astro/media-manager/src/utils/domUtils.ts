export function getElement<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export function toggleElement(
  element: HTMLElement | null,
  show: boolean
): void {
  if (!element) return;

  if (show) {
    element.classList.remove("hidden");
  } else {
    element.classList.add("hidden");
  }
}

export function setElementWidth(
  element: HTMLElement | null,
  percent: number
): void {
  if (!element) return;
  element.style.width = `${percent}%`;
}

export function updateElementText(
  element: HTMLElement | null,
  text: string
): void {
  if (!element) return;
  element.textContent = text;
}

export function preventEvent(e: Event): void {
  e.preventDefault();
  e.stopPropagation();
}

export function getDataFromElement<T>(element: Element): T | null {
  const dataJson = element.getAttribute("data-items");
  if (!dataJson) return null;
  try {
    return JSON.parse(dataJson) as T;
  } catch {
    return null;
  }
}
