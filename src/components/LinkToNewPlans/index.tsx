import * as React from 'react';
import { Link } from 'react-router-dom';
import { NEW_PLAN_URL } from '../../constants';

/** interface for LinkToNewPlans component props */
export interface Props {
  className: string;
  text: string;
}

/** LinkToNewPlans component */
const LinkToNewPlans = (props: Props) => {
  const { className, text } = props;
  return (
    <Link to={NEW_PLAN_URL} className={className}>
      {text}
    </Link>
  );
};

const defaultProps: Props = {
  className: 'focus-investigation btn btn-primary float-right mt-5',
  text: 'Add Focus Investigation',
};
LinkToNewPlans.defaultProps = defaultProps;

export default LinkToNewPlans;
