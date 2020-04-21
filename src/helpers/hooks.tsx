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
