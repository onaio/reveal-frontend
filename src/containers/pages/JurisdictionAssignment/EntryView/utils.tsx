/** collection of hooks that are used in the jurisdiction Assignment pages
 * these hooks majorly focus on abstracting the opensrp service calls.
 */
import { Result } from '@onaio/utils/dist/types/types';
import React from 'react';
import { ActionCreator } from 'redux';
import { getAncestors } from '../../../../components/TreeWalker/helpers';
import {
  COULD_NOT_LOAD_JURISDICTION,
  COULD_NOT_LOAD_JURISDICTION_HIERARCHY,
  COULD_NOT_LOAD_PLAN,
} from '../../../../configs/lang';
import { PlanDefinition } from '../../../../configs/settings';
import {
  loadJurisdiction,
  LoadOpenSRPHierarchy,
} from '../../../../helpers/dataLoading/jurisdictions';
import { loadOpenSRPPlan } from '../../../../helpers/dataLoading/plans';
import { StartLoading, StopLoading } from '../../../../helpers/useLoadingReducer';
import { OpenSRPService } from '../../../../services/opensrp';
import { FetchedTreeAction } from '../../../../store/ducks/opensrp/hierarchies';
import { RawOpenSRPHierarchy, TreeNode } from '../../../../store/ducks/opensrp/hierarchies/types';
import { AddPlanDefinitionAction } from '../../../../store/ducks/opensrp/PlanDefinition';
import { HandleBrokenPage } from '../helpers/utils';

/** hook to load a plan and dispatch to store
 * @param routePlanId - id of the plan, usually got from the route
 * @param plan - if the plan exists, otherwise null
 * @param serviceClass -  opensrp service
 * @param fetchPlanCreator - action creator to be called with plan payload once fetched
 * @param handleBrokenPage - helper to handle errors
 * @param stopLoading- helper to denote when loading should stop
 * @param startLoading - helper to denote when loading should start
 */
export function usePlanEffect(
  routePlanId: string,
  plan: PlanDefinition | null,
  serviceClass: typeof OpenSRPService,
  fetchPlanCreator: ActionCreator<AddPlanDefinitionAction>,
  handleBrokenPage: HandleBrokenPage,
  stopLoading: StopLoading,
  startLoading: StartLoading
) {
  React.useEffect(() => {
    // create promise to fetch the plan
    const planLoadingKey = 'planMetadata';
    startLoading(planLoadingKey, !plan);
    const planDataPromise = loadOpenSRPPlan(routePlanId, serviceClass, fetchPlanCreator).catch(
      _ => {
        handleBrokenPage(COULD_NOT_LOAD_PLAN);
      }
    );

    Promise.all([planDataPromise])
      .finally(() => {
        stopLoading(planLoadingKey);
      })
      .catch(e => handleBrokenPage(e.message));
  }, []);
}

/** gets the rootJurisdictionId - uses any of the assigned/existing jurisdictions
 * @param plan - the plan if it exists, otherwise null
 * @param serviceClass - the opensrpService
 * @param handleBrokenPage - helper to handle errors
 * @param stopLoading - helper to stop loading
 * @param startLoading - helper to start loading
 * @param tree - the tree if it exists, used to know if we should set loading to true.
 */
export function useGetRootJurisdictionId(
  plan: PlanDefinition | null,
  serviceClass: typeof OpenSRPService,
  handleBrokenPage: HandleBrokenPage,
  stopLoading: StopLoading,
  startLoading: StartLoading,
  tree?: TreeNode
) {
  const [rootJurisdictionId, setRootJurisdictionId] = React.useState<string>('');
  React.useEffect(() => {
    if (plan) {
      const oneOfJurisdictions = plan.jurisdiction.map(
        jurisdictionCode => jurisdictionCode.code
      )[0];
      // get the rootJurisdiction
      const rootJurisdictionKey = 'rootJurisdiction';
      startLoading(rootJurisdictionKey, !tree);
      loadJurisdiction(oneOfJurisdictions, serviceClass)
        .then(result => {
          if (!result || result.error) {
            throw new Error(COULD_NOT_LOAD_JURISDICTION);
          }
          if (result.value) {
            // TODO: review this - we already have the entire hierarchy in
            // the hierarchy reducer module, do we need to always call OpenSRP?
            // -> this is where we add the hierarchy. we are getting a single jurisdiction from the plan
            // using that to get the root jurisdiction, and then requesting the hierarchy to save to store.
            return getAncestors(result.value)
              .then(ancestors => {
                if (ancestors.value) {
                  // get the first ancestor
                  const rootJurisdiction = ancestors.value[0];
                  setRootJurisdictionId(rootJurisdiction.id);
                } else {
                  throw new Error(COULD_NOT_LOAD_JURISDICTION);
                }
              })
              .catch(e => {
                throw e;
              });
          }
        })
        .finally(() => {
          stopLoading(rootJurisdictionKey);
        })
        .catch(error => {
          handleBrokenPage(error.message);
        });
    }
  }, [plan]);

  return rootJurisdictionId;
}

/** get the jurisdiction Tree given the rootJurisdiction Id
 * @param rootJurisdictionId - id of top level jurisdiction
 * @param startLoading - helper to start loading
 * @param treeFetchedCreator - action creator to be called with tree payload once fetched
 * @param stopLoading - helper to stop loading
 * @param handleBrokenPage - helper to handle page errors
 * @param tree - the tree if it exists, used to know if we should set loading to true.
 */
export function useGetJurisdictionTree(
  rootJurisdictionId: string,
  startLoading: StartLoading,
  treeFetchedCreator: ActionCreator<FetchedTreeAction>,
  stopLoading: StopLoading,
  handleBrokenPage: HandleBrokenPage,
  tree?: TreeNode
) {
  React.useEffect(() => {
    const params = {
      return_structure_count: true,
    };
    if (rootJurisdictionId) {
      startLoading(rootJurisdictionId, !tree);
      LoadOpenSRPHierarchy(rootJurisdictionId, OpenSRPService, params)
        .then((apiResponse: Result<RawOpenSRPHierarchy>) => {
          if (apiResponse.value) {
            const responseData = apiResponse.value;
            treeFetchedCreator(responseData);
          }
          if (apiResponse.error) {
            throw new Error(COULD_NOT_LOAD_JURISDICTION_HIERARCHY);
          }
        })
        .finally(() => {
          stopLoading(rootJurisdictionId);
        })
        .catch(() => {
          handleBrokenPage(COULD_NOT_LOAD_JURISDICTION_HIERARCHY);
        });
    }
  }, [rootJurisdictionId]);
}
