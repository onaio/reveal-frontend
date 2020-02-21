import reducerRegistry from '@onaio/redux-reducer-registry';
import superset from '@onaio/superset-connector';
import React, { useEffect, useState } from 'react';
import GisidaWrapper from '../../components/GisidaWrapper';
import Loading from '../../components/page/Loading';
import { SUPERSET_JURISDICTIONS_SLICE, SUPERSET_MAX_RECORDS } from '../../configs/env';
import { displayError } from '../../helpers/errors';
import supersetFetch from '../../services/superset';
import jurisdictionReducer, {
  fetchJurisdictions,
  Jurisdiction,
  reducerName as jurisdictionReducerName,
} from '../../store/ducks/jurisdictions';

/** register the jurisdictions reducer */
reducerRegistry.register(jurisdictionReducerName, jurisdictionReducer);

/** Interface for JurisdictionMap props */
interface JurisdictionMapProps {
  cssClass: string;
  fetchJurisdictionsActionCreator: typeof fetchJurisdictions;
  jurisdiction: Jurisdiction | null;
  jurisdictionId: string | null;
  minHeight: string;
  supersetService: typeof supersetFetch;
}

/** This component renders a map of a given jurisdiction */
const JurisdictionMap = (props: JurisdictionMapProps) => {
  const [loading, setLoading] = useState(true);
  const [errorOcurred, setErrorOcurred] = useState(false);

  const {
    cssClass,
    fetchJurisdictionsActionCreator,
    jurisdictionId,
    jurisdiction,
    minHeight,
    supersetService,
  } = props;

  if (jurisdictionId && jurisdiction) {
    /** define superset filter params for jurisdictions */
    const supersetParams = superset.getFormData(SUPERSET_MAX_RECORDS, [
      { comparator: jurisdictionId, operator: '==', subject: 'jurisdiction_id' },
    ]);

    useEffect(() => {
      supersetService(SUPERSET_JURISDICTIONS_SLICE, supersetParams)
        .then((result: Jurisdiction[]) => {
          if (result) {
            fetchJurisdictionsActionCreator(result);
          } else {
            setErrorOcurred(true);
            displayError(new Error('An error occurred'));
          }
        })
        .finally(() => setLoading(false))
        .catch(err => {
          setErrorOcurred(true);
          displayError(err);
        });
    }, []);
  } else {
    setErrorOcurred(true);
  }

  if (loading === true) {
    return <Loading />;
  }

  if (errorOcurred === true) {
    return null;
  }

  return (
    <div className={cssClass}>
      <GisidaWrapper geoData={jurisdiction} minHeight={minHeight} />
    </div>
  );
};

/** Default props for JurisdictionMap */
const defaultProps: JurisdictionMapProps = {
  cssClass: 'map-area',
  fetchJurisdictionsActionCreator: fetchJurisdictions,
  jurisdiction: null,
  jurisdictionId: null,
  minHeight: '200px',
  supersetService: supersetFetch,
};

JurisdictionMap.defaultProps = defaultProps;
