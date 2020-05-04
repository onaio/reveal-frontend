import React from 'react';
import './sortHelpers.css';

/** props passed to the Sort icon per column of react-Table */
interface SortIconProps {
  isSorted: boolean;
  isSortedDesc: boolean;
}

/** component used to render a custom sort direction icon */
export const SortIcon = (props: any) => {
  const cssClass = props.isSorted ? (props.isSortedDesc ? 'asc' : 'desc') : '';
  return (
    <div className="icon-wrapper">
      <div className={`previous-next-filled ${cssClass} icon`} />
    </div>
  );
};
