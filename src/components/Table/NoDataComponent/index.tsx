/** used to show that there was not data component received
 * in @onaio/drill-down-table
 */
import React from 'react';
import { NO_DATA_FOUND } from '../../../configs/lang';
import './index.css';

interface Props {
  message: string;
}

const defaultProps: Props = {
  message: NO_DATA_FOUND,
};

const NoDataComponent = (props: Props) => {
  return (
    <div className="no-data-cls">
      <p>{props.message}</p>
    </div>
  );
};

NoDataComponent.defaultProps = defaultProps;

export { NoDataComponent };
