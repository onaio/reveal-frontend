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
import { OpenSRPService } from '../../../../services/opensrp';
import { RawOpenSRPHierarchy, TreeNode } from '../../../../store/ducks/opensrp/hierarchies/types';
import { AddPlanDefinitionAction } from '../../../../store/ducks/opensrp/PlanDefinition';

export function usePlanEffect(
  routePlanId: string,
  plan: PlanDefinition | null,
  serviceClass: typeof OpenSRPService,
  fetchPlanCreator: ActionCreator<AddPlanDefinitionAction>,
  handleBrokenPage: any,
  stopLoading: any,
  startLoading: any
) {
  React.useEffect(() => {
    // create promise to fetch the plan
    const planAndMetaLoadingKey = 'planMetadata';
    startLoading(planAndMetaLoadingKey, !plan);
    const planDataPromise = loadOpenSRPPlan(routePlanId, serviceClass, fetchPlanCreator).catch(
      _ => {
        handleBrokenPage(COULD_NOT_LOAD_PLAN);
      }
    );

    Promise.all([planDataPromise])
      .finally(() => {
        stopLoading(planAndMetaLoadingKey);
      })
      .catch(e => handleBrokenPage(e.message));
  }, []);
}

export function useGetRootJurisdictionId(
  plan: PlanDefinition | null,
  serviceClass: typeof OpenSRPService,
  handleBrokenPage: any,
  stopLoading: any,
  startLoading: any,
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
            stopLoading(rootJurisdictionKey);
            throw new Error(COULD_NOT_LOAD_JURISDICTION);
          }
          if (result.value) {
            // TODO: review this - we already have the entire hierarchy in
            // the hierarchy reducer module, do we need to always call OpenSRP?
            // -> this is where we add the hierarchy. we are getting a single jurisdiction from the plan
            // using that to get the root jurisdiction, and then requesting the hierarchy to save to store.
            getAncestors(result.value)
              .then(ancestors => {
                if (ancestors.value) {
                  // get the first ancestor
                  const rootJurisdiction = ancestors.value[0];
                  setRootJurisdictionId(rootJurisdiction.id);
                  stopLoading(rootJurisdictionKey);
                } else {
                  throw new Error(COULD_NOT_LOAD_JURISDICTION);
                }
              })
              .catch(e => {
                return e;
              });
          }
        })
        .catch(error => {
          handleBrokenPage(error.message);
        });
    }
  }, [plan]);

  return rootJurisdictionId;
}

export function useGetJurisdictionTree(
  rootJurisdictionId: string,
  startLoading: any,
  treeFetchedCreator: any,
  stopLoading: any,
  handleBrokenPage: any,
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
            stopLoading(rootJurisdictionId);
          }
          if (apiResponse.error) {
            throw new Error(COULD_NOT_LOAD_JURISDICTION_HIERARCHY);
          }
        })
        .catch(() => {
          handleBrokenPage(COULD_NOT_LOAD_JURISDICTION_HIERARCHY);
          stopLoading(rootJurisdictionId);
        });
    }
  }, [rootJurisdictionId]);
}
