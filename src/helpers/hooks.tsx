import React from 'react';

/** This hook allows for a component to prompt the user if they are sure that they
 *  wish to close the the tab/window that the component is currently rendered
 * @param {boolean} enforce - a condition that controls whether to prompt user
 */
export function useConfirmOnBrowserUnload(enforce: boolean = false) {
  function callback(event: any) {
    if (enforce) {
      event.preventDefault();
      event.returnValue = '';
    }
  }
  React.useEffect(() => {
    window.addEventListener('beforeunload', callback);

    return () => window.removeEventListener('beforeunload', callback);
  });
}
