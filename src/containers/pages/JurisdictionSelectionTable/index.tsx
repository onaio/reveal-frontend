/** use a table view to select jurisdictions to be assigned to a plan
 * starting at the plan's jurisdiction parent id
 */

import superset from '@onaio/superset-connector';
import { useEffect } from 'react';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { Store } from 'redux';
import Loading from '../../../components/page/Loading';
import { withTreeWalker } from '../../../components/TreeWalker';
import { SimpleJurisdiction } from '../../../components/TreeWalker/types';
import { PlanDefinition } from '../../../configs/settings';
import { OPENSRP_PLANS } from '../../../constants';
import { displayError } from '../../../helpers/errors';
import { OpenSRPService } from '../../../services/opensrp';
import supersetFetch from '../../../services/superset';
import {
  addPlanDefinition,
  getPlanDefinitionById,
} from '../../../store/ducks/opensrp/PlanDefinition';
import { JurisdictionTable, JurisdictionTableProps, RouteParams } from './JurisdictionTable';

// import { loadOpenSRPPlans } from "../../../helpers/dataLoading/plans";

/** at this point; going into this page, what you have:
 * - a plan only, with the top jurisdiction somewhere in there
 */

interface Props {
  plan: PlanDefinition | null;
  addPlanActionCreator: any;
}

const defaultProps = {
  plan: null,
  addPlanActionCreator: addPlanDefinition,
};

type FinalPropTypes = Props & RouteComponentProps<RouteParams>;
const JurisdictionTableSelector = (props: FinalPropTypes) => {
  const { plan } = props;
  const [loading, setLoading] = useState<boolean>(true);
  const [broken, setBroken] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hierarchyLimits, setHierarchyLimits] = useState<SimpleJurisdiction[]>([]);

  const planId = props.match.params.planId;
  if (!planId) {
    return <h1>PlanId is missing</h1>;
  }

  const handleBrokenPage = (message: string) => {
    displayError(Error(message));
    setErrorMessage(message);
    setBroken(true);
  };

  useEffect(() => {
    // Get Plan hierarchy
    const supersetParams = superset.getFormData(15000, [
      { comparator: planId, operator: '==', subject: 'plan_id' },
    ]);
    const planHierarchyPromise = supersetFetch('577')
      .then((result: SimpleJurisdiction[]) => {
        if (result) {
          setHierarchyLimits(result);
        } else {
          if (hierarchyLimits.length < 1) {
            // this means that we basically have not succeeded to make this call
            // if hierarchyLimits is not populated we cannot proceed
            handleBrokenPage('Unable to load the plan jurisdiction hierarchy');
          }
        }
      })
      .catch(e => {
        handleBrokenPage(e.message);
      });

    const OpenSRPPlanService = new OpenSRPService(OPENSRP_PLANS);
    const planIdInUrl = props.match.params.planId;
    const plansPromise = OpenSRPPlanService.read(planIdInUrl)
      .then((response: PlanDefinition[]) => {
        if (response && response.length > 0) {
          // save plan to store
          props.addPlanActionCreator(response[0]);
        } else {
          if (!plan) {
            // this means that we basically have not succeeded to make this call
            // if no plan then we cannot proceed
            handleBrokenPage('Unable to load plan');
          }
        }
      })
      .catch(e => {
        handleBrokenPage(e.message);
      });
    Promise.all([planHierarchyPromise, OpenSRPPlanService])
      .finally(() => setLoading(false))
      .catch(e => {
        handleBrokenPage(e.message);
      });
  }, []);

  useEffect(() => {
    // update this plan from api as a matter of procedure
    const planIdInUrl = props.match.params.planId;
    // TODO - define this
    // loadOpenSRPPlan(planId);

    // fetch current plan
  }, []);

  // plan.jurisdiction seem to represent lowe leverl jurisdictions

  if (loading) {
    // TODO: show message of what is actually loading
    // return <Fragment>plan hierarchy loading...</Fragment>;
    return <Loading />;
  }
  const currentNode = null;
  let jurisdictionId = props.match.params.jurisdictionId;
  if (!jurisdictionId) {
    jurisdictionId = '';
    // jurisdictionId = plan!.jurisdiction[0].code;
  }

  /** how do we want this to work
   * 1) using the tree walker we should start at the root jurisdiction
   * 2).
   */

  // TODO: Determine if this can safely be moved outside this component so as not to remount
  const WrappedJurisdictionTable = withTreeWalker<JurisdictionTableProps>(JurisdictionTable);

  const wrappedProps = {
    ...props,
    LoadingIndicator: Loading, // TODO: indicate what is loading
    jurisdictionId,
    limits: hierarchyLimits,
    plan,
  };

  return <WrappedJurisdictionTable {...wrappedProps} />;
};

JurisdictionTableSelector.defaultProps = defaultProps;

export { JurisdictionTableSelector };

// create connected component here to read the plan from store

/** map dispatch to props */
const mapDispatchToProps = {
  addPlanActionCreator: addPlanDefinition,
};

/** map state to props */
const mapStateToProps = (state: Partial<Store>, ownProps: any): any => {
  // TODO: use reselect
  const plan = getPlanDefinitionById(state, ownProps.match.params.planId);

  return {
    plan,
  };
};

/** Connected PlanAssignment component */
export const ConnectedJurisdictionSelector = connect(
  mapStateToProps,
  mapDispatchToProps
)(JurisdictionTableSelector);
