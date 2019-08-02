import * as React from 'react';
import { Link } from 'react-router-dom';
import { NEW_PLAN_URL } from '../../constants';

function LinkToNewPlans() {
  return (
    <Link to={NEW_PLAN_URL} className="focus-investigation btn btn-primary float-right mt-5">
      Add Focus Investigation
    </Link>
  );
}

export default LinkToNewPlans;
