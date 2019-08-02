import * as React from 'react';
import { Link } from 'react-router-dom';
import { NEW_PLAN_URL } from '../../constants';

export interface Props {
  classProp: string;
}

const LinkToNewPlans = ({
  classProp = 'focus-investigation btn btn-primary float-right mt-5',
}: Props) => {
  return (
    <Link to={NEW_PLAN_URL} className={classProp}>
      Add Focus Investigation
    </Link>
  );
};

export default LinkToNewPlans;
