import { URLParams } from '@opensrp/server-service';
import { OPENSRP_JURISDICTION_HIERARCHY_ENDPOINT } from '../../constants';
import { RawOpenSRPHierarchy } from '../../containers/pages/JurisdictionSelectionTable/utils';
import { OpenSRPService } from '../../services/opensrp';
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
