import { viewport } from '@mapbox/geo-viewport';
import GeojsonExtent from '@mapbox/geojson-extent';
import { SingleObject } from '@onaio/cbv';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import React, { useEffect, useState } from 'react';
import { MemoizedGisidaLite } from '../../components/GisidaLite';
import Loading from '../../components/page/Loading';
import { SUPERSET_JURISDICTIONS_SLICE } from '../../configs/env';
import { AN_ERROR_OCCURRED, JURISDICTION_LOADING_ERROR } from '../../configs/lang';
import { JURISDICTION_ID, MAP_AREA, TWO_HUNDRED_PX } from '../../constants';
import { displayError } from '../../helpers/errors';
import supersetFetch from '../../services/superset';
import jurisdictionReducer, {
  fetchJurisdictions,
  Jurisdiction,
  makeJurisdictionByIdSelector,
  reducerName as jurisdictionReducerName,
} from '../../store/ducks/jurisdictions';
import { buildJurisdictionLayers } from '../pages/FocusInvestigation/map/active/helpers/utils';

/** register the jurisdictions reducer */
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);

/** Interface for JurisdictionMap props */
export interface JurisdictionMapProps {
  callback: (jurisdiction: Jurisdiction) => void;
  cssClass: string;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  jurisdiction: Jurisdiction | null;
  jurisdictionId: string | null;
  minHeight: string;
  supersetService: typeof supersetFetch;
}

/** This component renders a map of a given jurisdiction */
export const JurisdictionMap = (props: JurisdictionMapProps) => {
  const [loading, setLoading] = useState(true);
  const [errorOcurred, setErrorOcurred] = useState(false);

  const {
    callback,
    cssClass,
    fetchJurisdictionsActionCreator,
    jurisdictionId,
    jurisdiction,
    minHeight,
    supersetService,
  } = props;

  /** define superset filter params for jurisdictions */
  const supersetParams = jurisdictionId
    ? superset.getFormData(1, [
        { comparator: jurisdictionId, operator: '==', subject: JURISDICTION_ID },
      ])
    : {};

  useEffect(() => {
    supersetService(SUPERSET_JURISDICTIONS_SLICE, supersetParams)
      .then((result: Jurisdiction[]) => {
        if (result) {
          fetchJurisdictionsActionCreator(result);
        } else {
          setErrorOcurred(true);
          displayError(new Error(AN_ERROR_OCCURRED));
        }
      })
      .finally(() => setLoading(false))
      .catch(err => {
        setErrorOcurred(true);
        displayError(err);
      });
  }, []);

  if (loading === true) {
    return <Loading />;
  }

  if (errorOcurred === true) {
    return <div>{JURISDICTION_LOADING_ERROR}</div>;
  }

  if (jurisdiction) {
    callback(jurisdiction);
  }

  const jurisdictionLayers = buildJurisdictionLayers(jurisdiction);
  let mapCenter;
  let mapBounds;
  let zoom;
  if (jurisdiction?.geojson?.geometry) {
    mapBounds = GeojsonExtent(jurisdiction.geojson);
    const centerAndZoom = viewport(mapBounds, [200, 100]);
    zoom = centerAndZoom.zoom;
    mapCenter = centerAndZoom.center;
  }

  return (
    <div className={cssClass}>
      <MemoizedGisidaLite
        layers={jurisdictionLayers}
        zoom={zoom}
        mapCenter={mapCenter}
        mapBounds={mapBounds}
        mapHeight={minHeight}
      />
    </div>
  );
};

/** Default props for JurisdictionMap */
export const defaultProps: JurisdictionMapProps = {
  callback: (_: Jurisdiction) => void 0,
  cssClass: MAP_AREA,
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  jurisdiction: null,
  jurisdictionId: null,
  minHeight: TWO_HUNDRED_PX,
  supersetService: supersetFetch,
};

JurisdictionMap.defaultProps = defaultProps;

const jurisdictionByIdSelector = makeJurisdictionByIdSelector();

/** SingleObject options */
const objectListOptions = {
  actionCreator: fetchJurisdictions,
  dispatchPropName: 'fetchJurisdictionsActionCreator',
  returnPropName: 'jurisdiction',
  selector: jurisdictionByIdSelector,
};

const ConnectedJurisdictionMap = new SingleObject<
  Jurisdiction,
  any, // TODO: why does Typescript complain when we set this to FetchJurisdictionAction?
  typeof jurisdictionByIdSelector,
  JurisdictionMapProps
>(JurisdictionMap, objectListOptions);

/** This represents a fully redux-connected component that fetches data from
 * an API.
 */
export default ConnectedJurisdictionMap.render();
