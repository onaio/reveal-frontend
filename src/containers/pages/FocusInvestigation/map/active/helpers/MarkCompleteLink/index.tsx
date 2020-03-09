import * as React from 'react';
import { Link } from 'react-router-dom';
import { MARK_AS_COMPLETE } from '../../../../../../../configs/lang';
import { PLAN_COMPLETION_URL } from '../../../../../../../constants';
import { Plan, PlanStatus } from '../../../../../../../store/ducks/plans';

export interface MarkCompleteLinkProps {
  plan: Plan;
}

/**
 * Link to mark the plan as complete
 * @param props
 * @returns {Link|null} Link if the plan status is active or null othewise
 */
const MarkCompleteLink = (props: MarkCompleteLinkProps) => {
  const { plan } = props;

  if (plan && plan.plan_status === PlanStatus.ACTIVE) {
    return (
      <Link className="btn btn-primary" to={`${PLAN_COMPLETION_URL}/${plan.id}`} color="primary">
        {MARK_AS_COMPLETE}
      </Link>
    );
  }

  return null;
};

export default MarkCompleteLink;
