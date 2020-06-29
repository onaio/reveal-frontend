/** the Jurisdiction Selection view
 * Responsibilities:
 *  load plan given a url
 *  render map.
 *  render table from which a user can assign jurisdictions to the active plan
 */

import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { ActionCreator, Store } from 'redux';
import { PlanDefinition } from '../../../configs/settings';
import { loadOpenSRPPlan } from '../../../helpers/dataLoading/plans';
import { OpenSRPService } from '../../../services/opensrp';
import {
  addPlanDefinition,
  AddPlanDefinitionAction,
  getPlanDefinitionById,
} from '../../../store/ducks/opensrp/PlanDefinition';
import { JurisdictionSelectorTableProps, JurisdictionTable } from './JurisdictionTable';

export interface Props {
  fetchPlanCreator: ActionCreator<AddPlanDefinitionAction>;
  plan: PlanDefinition | null;
  serviceClass: typeof OpenSRPService;
}

export const defaultProps = {
  fetchPlanCreator: addPlanDefinition,
  plan: null,
  serviceClass: OpenSRPService,
};

interface RouteParams {
  planId: string;
}
export type JurisdictionAssignmentViewFullProps = Props & RouteComponentProps<RouteParams>;

export const JurisdictionAssignmentView = (props: JurisdictionAssignmentViewFullProps) => {
  const { plan, serviceClass, fetchPlanCreator } = props;
  React.useEffect(() => {
    const planId = props.match.params.planId;
    loadOpenSRPPlan(planId, serviceClass, fetchPlanCreator).catch(_ => {
      // TODO - handle error
    });
  }, []);

  if (!plan) {
    // TODO
    return <p>You cannot do this</p>;
  }

  const rootJurisdictionId = plan.jurisdiction.map(jurisdictionCode => jurisdictionCode.code)[0];

  const JurisdictionTableProps: JurisdictionSelectorTableProps = {
    rootJurisdictionId,
    serviceClass,
  };

  return <JurisdictionTable {...JurisdictionTableProps} />;
};

JurisdictionAssignmentView.defaultProps = defaultProps;

type MapStateToProps = Pick<Props, 'plan'>;
type DispatchToProps = Pick<Props, 'fetchPlanCreator'>;

const mapStateToProps = (
  state: Partial<Store>,
  ownProps: JurisdictionAssignmentViewFullProps
): MapStateToProps => {
  const planId = ownProps.match.params.planId;
  const planObj = getPlanDefinitionById(state, planId);
  return {
    plan: planObj,
  };
};

const mapDispatchToProps: DispatchToProps = {
  fetchPlanCreator: addPlanDefinition,
};

const ConnectedJurisdictionAssignmentView = connect(
  mapStateToProps,
  mapDispatchToProps
)(JurisdictionAssignmentView);

export default ConnectedJurisdictionAssignmentView;