import { Dictionary } from '@onaio/utils/dist/types/types';
import { URLParams } from '@opensrp/server-service';
import { ActionCreator } from 'redux';
import { OpenSRPJurisdiction } from '../../components/TreeWalker/types';
import { COULD_NOT_LOAD_JURISDICTION } from '../../configs/lang';
import { PlanDefinition } from '../../configs/settings';
import {
  OPENSRP_FIND_LOCATION_BY_JURISDICTION_IDS,
  OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT,
  OPENSRP_PLANS,
  OPENSRP_V2_SETTINGS,
} from '../../constants';
import { OpenSRPService } from '../../services/opensrp';
import store from '../../store';
import { RawOpenSRPHierarchy } from '../../store/ducks/opensrp/hierarchies/types';
import {
  fetchJurisdictionsMetadata,
  FetchJurisdictionsMetadataAction,
  JurisdictionsMetadata,
} from '../../store/ducks/opensrp/jurisdictionsMetadata';
import { AddPlanDefinitionAction } from '../../store/ducks/opensrp/PlanDefinition';
import { failure, success } from './utils';

/** find plans that the given user has access to
 * @param {string} jurisdictionId - username
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 * @param {URLParams | null} params - search params filters
 */
export async function LoadOpenSRPHierarchy<T = RawOpenSRPHierarchy>(
  jurisdictionId: string,
  service: typeof OpenSRPService = OpenSRPService,
  params: URLParams | null = null
) {
  const serve = new service(OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT);
  return await serve
    .read(jurisdictionId, params)
    .then((response: T) => {
      return success<T>(response);
    })
    .catch((err: Error) => {
      return failure(err);
    });
}

/** send plan payload to api
 * @param planPayload - original plan definition
 * @param jurisdictionIds -  the ids to attach to plan
 * @param  service - the openSRP service
 */
export async function putJurisdictionsToPlan(
  planPayload: PlanDefinition,
  jurisdictionIds: string[],
  service: typeof OpenSRPService = OpenSRPService,
  fetchPlanCreator: ActionCreator<AddPlanDefinitionAction>
) {
  const serve = new service(OPENSRP_PLANS);
  const jurisdictions = jurisdictionIds.map(jurisdictionId => ({ code: jurisdictionId }));
  const payload = { ...planPayload, jurisdiction: jurisdictions };
  return await serve
    .update(payload)
    .then(response => {
      fetchPlanCreator(payload);
      return success<Dictionary | undefined>(response);
    })
    .catch((err: Error) => {
      return failure(err);
    });
}

export const defaultLocationParams = {
  is_jurisdiction: true,
  return_geometry: false,
};

export const defaultJurisdictionSettingsParams = {
  serverVersion: '0',
};

/** given a single jurisdiction, this will return the Jurisdiction object from opensrp */
export async function loadJurisdiction(
  jurisdictionId: string,
  serviceClass: typeof OpenSRPService,
  params: URLParams = defaultLocationParams
) {
  const service = new serviceClass(OPENSRP_FIND_LOCATION_BY_JURISDICTION_IDS);
  const fullParams = {
    ...params,
    jurisdiction_ids: jurisdictionId,
  };
  return await service
    .list(fullParams)
    .then((response: OpenSRPJurisdiction[]) => {
      if (response) {
        if (response.length === 0) {
          return failure(new Error(COULD_NOT_LOAD_JURISDICTION));
        }
        const jurisdiction = response[0];
        return success(jurisdiction);
      }
    })
    .catch((error: Error) => {
      return failure(error);
    });
}

export async function loadJurisdictionsMetadata(
  settingsIdentifier: string,
  serviceClass: typeof OpenSRPService,
  actionCreator: ActionCreator<FetchJurisdictionsMetadataAction> = fetchJurisdictionsMetadata,
  params: URLParams = defaultJurisdictionSettingsParams
) {
  const service = new serviceClass(OPENSRP_V2_SETTINGS);
  const queryParams = {
    ...params,
    identifier: settingsIdentifier,
  };
  return await service
    .read('', queryParams)
    .then((res: JurisdictionsMetadata[]) => {
      if (res) {
        store.dispatch(actionCreator(res));
      }
    })
    .catch((error: Error) => {
      return failure(error);
    });
}
