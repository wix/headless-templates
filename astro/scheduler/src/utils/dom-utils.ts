/**
 * DOM utility functions for manipulating and interacting with DOM elements
 */

/**
 * Creates an element with attributes and content
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, string> = {},
  innerHTML: string = ''
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Set content
  if (innerHTML) {
    element.innerHTML = innerHTML;
  }
  
  return element;
}

/**
 * Creates an element and appends it to a parent
 */
export function appendElement<K extends keyof HTMLElementTagNameMap>(
  parent: HTMLElement,
  tag: K,
  attributes: Record<string, string> = {},
  innerHTML: string = ''
): HTMLElementTagNameMap[K] {
  const element = createElement(tag, attributes, innerHTML);
  parent.appendChild(element);
  return element;
}

/**
 * Replaces the content of an element
 */
export function replaceContent(element: HTMLElement, content: string): void {
  element.innerHTML = content;
}

/**
 * Show a temporary message in an element
 */
export function showTemporaryMessage(
  element: HTMLElement, 
  message: string, 
  className: string = 'text-center py-2', 
  duration: number = 3000
): void {
  const originalContent = element.innerHTML;
  element.innerHTML = `<div class="${className}">${message}</div>`;
  
  setTimeout(() => {
    element.innerHTML = originalContent;
  }, duration);
}

/**
 * Creates a custom event and dispatches it
 */
export function dispatchCustomEvent<T>(
  eventName: string, 
  detail: T, 
  element: HTMLElement | Document = document
): void {
  const event = new CustomEvent(eventName, { detail });
  element.dispatchEvent(event);
}

/**
 * Add a one-time event listener
 */
export function addOneTimeEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void
): void {
  const oneTimeHandler = (event: HTMLElementEventMap[K]) => {
    handler(event);
    element.removeEventListener(eventName, oneTimeHandler as EventListener);
  };
  
  element.addEventListener(eventName, oneTimeHandler as EventListener);
}

/**
 * Scroll to an element smoothly
 */
export function scrollToElement(element: HTMLElement, options: ScrollIntoViewOptions = { behavior: 'smooth' }): void {
  element.scrollIntoView(options);
}