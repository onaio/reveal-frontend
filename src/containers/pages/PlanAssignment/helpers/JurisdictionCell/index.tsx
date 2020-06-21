import React from 'react';
import { Link } from 'react-router-dom';
import {
  OpenSRPJurisdiction,
  SimpleJurisdiction,
} from '../../../../../components/TreeWalker/types';
import { PlanDefinition } from '../../../../../configs/settings';
import { ASSIGN_PLAN_URL } from '../../../../../constants';

interface JurisdictionCellProps {
  limits: SimpleJurisdiction[];
  node: OpenSRPJurisdiction;
  plan: PlanDefinition;
}

const JurisdictionCell = (props: JurisdictionCellProps) => {
  const { limits, node, plan } = props;

  const focusAreas = plan.jurisdiction.map(item => item.code);
  const knownParentIds = limits.map(item => item.jurisdiction_parent_id);
  const stopHere: boolean = !knownParentIds.includes(node.id) || focusAreas.includes(node.id);

  if (stopHere) {
    return <span key={`${node.id}-span`}>{node.properties.name}</span>;
  }

  return (
    <Link key={`${node.id}-link`} to={`${ASSIGN_PLAN_URL}/${plan.identifier}/${node.id}`}>
      {node.properties.name}
    </Link>
  );
};

export { JurisdictionCell };
