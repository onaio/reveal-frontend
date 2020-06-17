import React, { Fragment, useEffect, useState } from 'react';
import { displayError } from '../helpers/errors';
import { getFilterParams, OpenSRPService, URLParams } from '../services/opensrp';

/** interface for jurisdiction options
 * These are received from the OpenSRP API
 */
interface OpenSRPJurisdiction {
  id: string;
  properties: {
    status: string;
    name: string;
    geographicLevel: number;
    version: string | number;
  };
  serverVersion: number;
  type: 'Feature';
}

interface SimpleProps {
  apiEndpoint: string;
  jurisdictionId: string;
  params: URLParams;
  serviceClass: typeof OpenSRPService;
}

const defaultSimpleProps: SimpleProps = {
  apiEndpoint: 'location/findByProperties',
  jurisdictionId: '', // '3019',
  params: {
    is_jurisdiction: true,
    return_geometry: false,
  },
  serviceClass: OpenSRPService,
};

const Simple = (props: SimpleProps) => {
  // const [root, setRoot] = useState<OpenSRPJurisdiction | null>(null);
  const [current, setCurrent] = useState<OpenSRPJurisdiction[]>([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<OpenSRPJurisdiction | null>(
    null
  );
  const [hierarchy, setHierarchy] = useState<OpenSRPJurisdiction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { apiEndpoint, jurisdictionId, params, serviceClass } = props;

  const service = new serviceClass(apiEndpoint);

  const parentId = selectedJurisdiction ? selectedJurisdiction.id : jurisdictionId;

  const propertiesToFilter = {
    status: 'Active',
    ...(parentId === '' && { geographicLevel: 0 }),
    ...(parentId !== '' && { parentId }),
  };

  const paramsToUse = {
    ...params,
    ...(Object.keys(propertiesToFilter).length > 0 && {
      properties_filter: getFilterParams(propertiesToFilter),
    }),
  };

  // const backFill = () => {
  //   const newParams = {
  //     ...params,
  //     properties_filter: getFilterParams({
  //       status: 'Active',
  //       id: jurisdictionId
  //     })
  //   }
  //   while (root === null) {
  //     service.list(paramsToUse).then((response: OpenSRPJurisdiction[]) => {
  //       setCurrent(response);
  //     }).catch((error: Error) => displayError(error));
  //   }
  // }

  useEffect(() => {
    service
      .list(paramsToUse)
      .then((response: OpenSRPJurisdiction[]) => {
        setCurrent(response);
      })
      .finally(() => setLoading(false))
      .catch((error: Error) => displayError(error));
  }, [parentId]);

  if (loading === true) {
    return <Fragment>Loading...</Fragment>;
  }

  const loadMore = (item: OpenSRPJurisdiction, _: Event | React.MouseEvent) => {
    hierarchy.push(item);
    setHierarchy(hierarchy);
    setSelectedJurisdiction(item);
  };

  if (current.length > 0 || selectedJurisdiction !== null) {
    return (
      <Fragment>
        {selectedJurisdiction && (
          <Fragment>
            <h4>Currently Selected</h4>
            <span>{selectedJurisdiction.properties.name}</span>
          </Fragment>
        )}
        <h4>Path</h4>
        {hierarchy.map((item: OpenSRPJurisdiction, index: number) => (
          <span key={`jzz-${index}`} onClick={e => loadMore(item, e)}>
            {' '}
            {item.properties.name}
            {'>> '}
          </span>
        ))}
        <h4>Current children</h4>
        <ul>
          {current.map((item: OpenSRPJurisdiction, index: number) => (
            <li key={`jxx-${index}`} onClick={e => loadMore(item, e)}>
              {item.properties.name}
            </li>
          ))}
        </ul>
        ;
      </Fragment>
    );
  } else {
    return <Fragment>No Options</Fragment>;
  }
};

Simple.defaultProps = defaultSimpleProps;

export { Simple };
