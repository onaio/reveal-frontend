import * as React from 'react';
import { Badge } from 'reactstrap';
import { Plan, PlanStatus } from '../../../../../../../store/ducks/plans';

export interface StatusBadgeProps {
  plan: Plan;
}

/**
 * Badge component to show the plan status
 * @param props
 * @returns {Badge} A Badge
 */
const StatusBadge = (props: StatusBadgeProps) => {
  const { plan } = props;
  const color =
    (plan && plan.plan_status === PlanStatus.ACTIVE) ||
    (plan && plan.plan_status === PlanStatus.DRAFT)
      ? 'warning'
      : 'success';

  return (
    <Badge color={color} pill={true}>
      {plan && plan.plan_status}
    </Badge>
  );
};

export default StatusBadge;
