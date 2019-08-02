import * as React from 'react';
import { Link } from 'react-router-dom';
import { NEW_PLAN_URL } from '../../constants';

export interface Props {
  classProp: string;
}

const LinkToNewPlans = (props: Props) => {
  return (
    <Link to={NEW_PLAN_URL} className={props.classProp}>
      Add Focus Investigation
    </Link>
  );
};

const defaultProps: Props = { classProp: 'focus-investigation btn btn-primary float-right mt-5' };
LinkToNewPlans.defaultProps = defaultProps;

export default LinkToNewPlans;
