import { OPENSRP_HIERARCHY_ENDPOINT } from '../../constants';
import { RawOpenSRPHierarchy } from '../../containers/pages/JurisdictionSelectionTable/utils';
import { OpenSRPService } from '../../services/opensrp';
import { UUID } from '../../store/ducks/opensrp/events/utils';
import { failure, success } from './utils';

/** find plans that the given user has access to
 * @param {UUID} jurisdictionId - username
 * @param {ActionCreator<FetchPlansByUserAction>} actionCreator - action creator for adding practitioners to store
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 * @param {ActionCreator<AnyAction>} responseActionCreator - optionalActionCreator to dispatch the planData in response
 */
export async function LoadOpenSRPHierarchy<T = RawOpenSRPHierarchy>(
  jurisdictionId: UUID,
  service: typeof OpenSRPService = OpenSRPService
) {
  const serve = new service(OPENSRP_HIERARCHY_ENDPOINT);
  serve
    .read(jurisdictionId)
    .then((response: T) => {
      return success<T>(response);
    })
    .catch((err: Error) => {
      return failure(err);
    });
}
