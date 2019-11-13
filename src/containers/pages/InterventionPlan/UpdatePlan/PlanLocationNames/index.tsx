/** will be responsible for lazy loading location names that are
 * assigned to a specific plan
 */
import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { Fragment, ReactElement, useEffect } from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import Loading from '../../../../../components/page/Loading';
import { PlanDefinition } from '../../../../../configs/settings';
import { NO_PLAN_LOADED_MESSAGE, OPENSRP_LOCATIONS_BY_PLAN } from '../../../../../constants';
import { OpenSRPService } from '../../../../../services/opensrp';
import store from '../../../../../store';
import locationsReducer, {
  fetchLocations,
  getLocationsByPlanId,
  Location,
  reducerName as locationsReducerName,
} from '../../../../../store/ducks/opensrp/locations';

// register the locations reducer.
reducerRegistry.register(locationsReducerName, locationsReducer);

/** interface for props for the JurisdictionIdsToNames component */
interface Props {
  child?: (locationName: string, locationId: string, index: number) => ReactElement;
  fetchLocationsAction: typeof fetchLocations;
  locations: Location[];
  plan: PlanDefinition | null;
  serviceClass: typeof OpenSRPService;
}

const defaultProps: Props = {
  fetchLocationsAction: fetchLocations,
  locations: [],
  plan: null,
  serviceClass: OpenSRPService,
};

/** The JurisdictionIdToName component takes a plan and uses its id
 * to get location names which it renders in a list
 */
const PlanLocationNames = (props: Props) => {
  const { serviceClass, fetchLocationsAction, plan } = props;

  /** async function that takes in a planId and calls
   * performs the api call and then updates the store
   *
   * @param {typeof OpenSRPService} service - the opensrp service class
   * @param {string} planId - fetch locations attached to plan with this id
   * @param {typeof fetchLocations} actionCreator - action creator
   */
  async function loadLocations(
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
        /** what are we doing with errors?? */
      });
  }

  useEffect(() => {
    if (plan) {
      const planId = plan.identifier;
      loadLocations(serviceClass, planId, fetchLocationsAction);
    }
  }, []);

  if (props.locations.length < 1) {
    return <Loading minHeight={'5vh'} />;
  }

  return (
    <ul id="selected-jurisdiction-list">
      {props.locations.map((location, index) => {
        return (
          <li key={index}>
            <span>{location.name}</span>
            {props.child && props.child(location.name, location.identifier, index)}
          </li>
        );
      })}
    </ul>
  );
};

PlanLocationNames.defaultProps = defaultProps;

export { PlanLocationNames as JurisdictionIdToName };

// connect component

/** maps the props to portions of the store */
const mapStateToProps = (state: Partial<Store>, ownProps: Props) => {
  const planId = ownProps.plan ? ownProps.plan.identifier : '';
  const locations = getLocationsByPlanId(state, planId);
  return {
    locations,
  };
};

/** The JurisdictionToNames component connected to store */
const ConnectedPlansLocationNames = connect(mapStateToProps)(PlanLocationNames);

export default ConnectedPlansLocationNames;
