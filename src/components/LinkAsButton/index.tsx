import * as React from 'react';
import { Link } from 'react-router-dom';
import { LINK } from '../../configs/lang';
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

/** default props for LinkAsButton component */
const defaultProps: Props = {
  classNameProp: 'focus-investigation btn btn-primary float-right mt-5',
  text: LINK,
  to: NEW_PLAN_URL,
};
LinkAsButton.defaultProps = defaultProps;

export default LinkAsButton;
