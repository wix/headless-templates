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
 * Replaces the content of an element
 */
export function replaceContent(element: HTMLElement, content: string): void {
  element.innerHTML = content;
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


