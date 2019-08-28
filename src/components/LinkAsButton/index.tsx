import * as React from 'react';
import { Link } from 'react-router-dom';
import { NEW_PLAN_URL } from '../../constants';

/** interface for LinkAsButton component props */
export interface Props {
  classProp: string;
  text: string;
  to: string;
}

/** LinkAsButton component */
const LinkAsButton = (props: Props) => {
  const { to, classProp, text } = props;
  return (
    <Link to={to} className={classProp}>
      {text}
    </Link>
  );
};

const defaultProps: Props = {
  classProp: 'focus-investigation btn btn-primary float-right mt-5',
  text: 'Add Focus Investigation',
  to: NEW_PLAN_URL,
};
LinkAsButton.defaultProps = defaultProps;

export default LinkAsButton;
