import { Dictionary } from '@onaio/utils/dist/types/types';
import { URLParams } from '@opensrp/server-service';
import { OpenSRPJurisdiction } from '../../components/TreeWalker/types';
import { PlanDefinition } from '../../configs/settings';
import {
  OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT,
  OPENSRP_LOCATION,
  OPENSRP_PLANS,
} from '../../constants';
import { OpenSRPService } from '../../services/opensrp';
import { RawOpenSRPHierarchy } from '../../store/ducks/opensrp/hierarchies/types';
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
  service: typeof OpenSRPService = OpenSRPService
) {
  const serve = new service(OPENSRP_PLANS);
  const jurisdictions = jurisdictionIds.map(jurisdictionId => ({ code: jurisdictionId }));
  const payload = { ...planPayload, jurisdiction: jurisdictions };
  return await serve
    .update(payload)
    .then(response => {
      return success<Dictionary | undefined>(response);
    })
    .catch((err: Error) => {
      return failure(err);
    });
}

const locationParams = {
  is_jurisdiction: true,
  return_geometry: false,
};

/** given a single jurisdiction, this will return the Jurisdiction object from opensrp */
export async function loadJurisdiction(
  jurisdictionId: string,
  serviceClass: typeof OpenSRPService,
  params: URLParams = locationParams
) {
  const service = new serviceClass(OPENSRP_LOCATION);
  return await service
    .read(jurisdictionId, params)
    .then((response: OpenSRPJurisdiction) => {
      if (response) {
        return { error: null, value: response };
      }
    })
    .catch((error: Error) => {
      return { error, value: null };
    });
}
