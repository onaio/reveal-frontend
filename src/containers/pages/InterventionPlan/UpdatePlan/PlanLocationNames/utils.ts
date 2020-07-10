import { OPENSRP_LOCATIONS_BY_PLAN } from '../../../../../constants';
import { displayError } from '../../../../../helpers/errors';
import { OpenSRPService } from '../../../../../services/opensrp';
import store from '../../../../../store';
import { fetchLocations, Location } from '../../../../../store/ducks/opensrp/planLocations';

/** async function that takes in a planId and calls
 * performs the api call and then updates the store
 *
 * @param {typeof OpenSRPService} service - the opensrp service class
 * @param {string} planId - fetch locations attached to plan with this id
 * @param {typeof fetchLocations} actionCreator - action creator
 */
export async function loadLocations(
  service: typeof OpenSRPService,
  planId: string,
  actionCreator: typeof fetchLocations
) {
  // perform api call and dispatch result
  const serve = new service(OPENSRP_LOCATIONS_BY_PLAN);

  serve
    .read(planId)
    .then((response: Location[]) => {
      store.dispatch(actionCreator(response, planId));
    })
    .catch((err: Error) => {
      displayError(err);
    });
}
