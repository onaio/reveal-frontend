/** will be responsible for lazy loading location names that are
 * assigned to a specific plan
 */
import reducerRegistry from '@onaio/redux-reducer-registry';
import React, { ReactElement, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Store } from 'redux';
import Loading from '../../../../../components/page/Loading';
import { PlanDefinition } from '../../../../../configs/settings';
import { FI_SINGLE_URL } from '../../../../../constants';
import { displayError } from '../../../../../helpers/errors';
import { isPlanDefinitionOfType } from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';
import locationsReducer, {
  fetchLocations,
  getLocationsByPlanId,
  Location,
  reducerName as locationsReducerName,
} from '../../../../../store/ducks/opensrp/planLocations';
import { InterventionType } from '../../../../../store/ducks/plans';
import { loadLocations } from './utils';

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

/** The PlanLocationNames component takes a plan and uses its id
 * to get location names which it renders in a list
 */
const PlanLocationNames = (props: Props) => {
  const { serviceClass, fetchLocationsAction, plan } = props;

  useEffect(() => {
    if (plan) {
      const planId = plan.identifier;
      loadLocations(serviceClass, planId, fetchLocationsAction).catch(err => displayError(err));
    }
  }, []);

  if (plan === null || props.locations.length < 1) {
    return <Loading minHeight={'5vh'} />;
  }

  return (
    <ul id="selected-jurisdiction-list">
      {props.locations.map((location, index) => {
        return (
          <li key={index}>
            {isPlanDefinitionOfType(plan, [InterventionType.FI, InterventionType.DynamicFI]) ? (
              <Link to={`${FI_SINGLE_URL}/${location.identifier}`}>{location.name}</Link>
            ) : (
              <span>{location.name}</span>
            )}
            {props.child && props.child(location.name, location.identifier, index)}
          </li>
        );
      })}
    </ul>
  );
};

PlanLocationNames.defaultProps = defaultProps;

export { PlanLocationNames };

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
