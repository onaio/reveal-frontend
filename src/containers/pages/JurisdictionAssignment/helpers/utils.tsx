import { useState } from 'react';
import { displayError } from '../../../../helpers/errors';
import { TreeNode } from '../../../../store/ducks/opensrp/hierarchies/types';
import { nodeIsSelected } from '../../../../store/ducks/opensrp/hierarchies/utils';

/** tells whether we should select the parent checkbox in the table header
 * @param currentParentNode - the current parent node
 * @param currentChildren - current children
 */
export const checkParentCheckbox = (
  currentParentNode: TreeNode | undefined,
  currentChildren: TreeNode[]
) => {
  let selected = true;
  if (currentParentNode) {
    selected = selected && nodeIsSelected(currentParentNode);
  } else {
    // when currentParent node is undefined but there are currentChildren usually at the top level
    if (currentChildren.length > 0) {
      currentChildren.forEach(node => {
        selected = selected && nodeIsSelected(node);
      });
    } else {
      selected = false;
    }
  }
  return selected;
};

export const useHandleBrokenPage = () => {
  const [broken, setBroken] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  /** Convenience function to handle cases where we must abort and tell the user we have done so */
  const handleBrokenPage = (message: string) => {
    displayError(Error(message));
    setErrorMessage(message);
    setBroken(true);
  };

  return { broken, errorMessage, handleBrokenPage };
};

/** type of handle broken page helper */
export type HandleBrokenPage = (message: string) => void;
