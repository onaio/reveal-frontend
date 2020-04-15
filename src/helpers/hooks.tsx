import React from 'react';

/** This hook allows for a component to prompt the user if the user is sure that they
 *  wish to close the the tab/window that the component is currently rendered
 * @param {boolean} hasUnsavedChanges - a condition that controls whether to prompt user
 */
export function useConfirmOnBrowserUnload(hasUnsavedChanges: boolean = false) {
  function callback(event: Event) {
    if (hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = true;
    }
  }
  React.useEffect(() => {
    window.addEventListener('beforeunload', callback);

    return () => window.removeEventListener('beforeunload', callback);
  });
}

/**
 * Debounce calls to make sure they do not execute too frequently such as when
 * a user is typing and a call needs to be made to the API
 * @param value Value to be debounced
 * @param delay Time in ms to wait for since the last call
 */
export function useDebounce(value: string, delay: number = 1000) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Return a cleanup function that will be called every time ...
    // ... useEffect is re-called. useEffect will only be re-called ...
    // ... if value changes (see the inputs array below).
    // This is how we prevent debouncedValue from changing if value is ...
    // ... changed within the delay period. Timeout gets cleared and restarted.
    // To put it in context, if the user is typing within our app's ...
    // ... search box, we don't want the debouncedValue to update until ...
    // ... they've stopped typing for more than 1000ms.
    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  return debouncedValue;
}
