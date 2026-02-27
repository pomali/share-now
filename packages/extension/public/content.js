// Track the last editable element that was right-clicked
let lastEditableElement = null;

document.addEventListener('contextmenu', (event) => {
  const el = event.target;
  if (
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.isContentEditable
  ) {
    lastEditableElement = el;
  }
});

// Listen for fill messages relayed from the background service worker
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'fill' && message.text != null && lastEditableElement) {
    const el = lastEditableElement;
    if (el.isContentEditable) {
      el.textContent = message.text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // Use the native value setter so React's onChange fires correctly
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(el),
        'value'
      );
      if (nativeInputValueSetter && nativeInputValueSetter.set) {
        nativeInputValueSetter.set.call(el, message.text);
      } else {
        el.value = message.text;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    el.focus();
  }
});
