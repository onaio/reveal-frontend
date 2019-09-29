import * as React from 'react';
import { Link } from 'react-router-dom';
import { NEW_PLAN_URL } from '../../constants';

/** interface for LinkAsButton component props */
export interface Props {
  classNameProp: string;
  text: string;
  to: string;
}

/** LinkAsButton component */
const LinkAsButton = (props: Props) => {
  const { to, classNameProp, text } = props;
  return (
    <Link to={to} className={classNameProp}>
      {text}
    </Link>
  );
};

const defaultProps: Props = {
  classNameProp: 'btn btn-primary float-right mt-5',
  text: 'Add Focus Investigation',
  to: NEW_PLAN_URL,
};
LinkAsButton.defaultProps = defaultProps;

export default LinkAsButton;
