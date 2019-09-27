/** Single node in the tree, supports selecting node, clicking to expand node,
 * custom implementation on asynchronous loading
 * Asynchronous loading indicator
 */

import React from 'react';
import { InterventionType } from '../../../store/ducks/plans';

/** sample structure
 * [
 *  {
 *      label: 
 *      value:
 *      parent
 *  }
 * ],
 * onSelect: function when is selected. set state
 * onFinishselect: after finishing selecting call this with selected nodes
 */

 /** The node alone
  * {label, value, onSelect, Onclick}
  * onSelect should close
  */

interface Props{
    label: string;
    value: string;
    onSelect: () => void;
    onclick: () => void;
    checked: boolean;
}

export const TreeNode: React.FC<Props> = (props) =>{
  const {checked, label, onSelect, } = props;
  return (<React.Fragment>
    <input onClick={onselect} type="checkbox" checked={checked}></input>
    <span className="span-link" oncClick={onClick}>{label}</span>
  </React.Fragment>)
}