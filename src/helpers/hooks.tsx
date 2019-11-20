import React from 'react';

export function useConfirmOnBrowserUnload() {
  React.useEffect(() => {
    window.addEventListener('beforeunload', event => {
      event.preventDefault();
      event.returnValue = '';
    });
  });
}
