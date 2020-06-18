import React, { Fragment, useEffect, useState } from 'react';
import { displayError } from '../../helpers/errors';
import { getFilterParams, OpenSRPService, URLParams } from '../../services/opensrp';

/** interface for jurisdiction options
 * These are received from the OpenSRP API
 */
interface OpenSRPJurisdiction {
  id: string;
  properties: {
    status: string;
    name: string;
    geographicLevel: number;
    parentId?: string;
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

const defaultParams = {
  is_jurisdiction: true,
  return_geometry: false,
};

const defaultSimpleProps: SimpleProps = {
  apiEndpoint: 'location/findByProperties',
  jurisdictionId: '',
  params: defaultParams,
  serviceClass: OpenSRPService,
};

const getAncestors = async (
  jurisdiction: OpenSRPJurisdiction,
  path: OpenSRPJurisdiction[] = []
): Promise<OpenSRPJurisdiction[] | null> => {
  if (!path.includes(jurisdiction)) {
    path.unshift(jurisdiction);
  }

  if (jurisdiction.properties.geographicLevel === 0 || !jurisdiction.properties.parentId) {
    return path;
  }

  const service = new OpenSRPService('location');
  const parentJurisdiction = await service
    .read(jurisdiction.properties.parentId, defaultParams)
    .then((response: OpenSRPJurisdiction) => {
      if (response) {
        return response;
      }
    })
    .catch((error: Error) => displayError(error));

  if (!parentJurisdiction) {
    return null;
  } else {
    return getAncestors(parentJurisdiction, path);
  }
};

const Simple = (props: SimpleProps) => {
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

  useEffect(() => {
    if (!selectedJurisdiction && jurisdictionId !== '') {
      const singleService = new OpenSRPService('location');
      singleService
        .read(jurisdictionId, params)
        .then((response: OpenSRPJurisdiction) => {
          if (response) {
            setSelectedJurisdiction(response);
            getAncestors(response)
              .then((path: OpenSRPJurisdiction[] | null) => {
                if (path) {
                  setHierarchy(path);
                }
              })
              .catch((error: Error) => displayError(error));
          }
        })
        .catch((error: Error) => displayError(error));
    }
  }, []);

  useEffect(() => {
    service
      .list(paramsToUse)
      .then((response: OpenSRPJurisdiction[]) => {
        if (response) {
          setCurrent(response);
        }
      })
      .finally(() => setLoading(false))
      .catch((error: Error) => displayError(error));
  }, [parentId]);

  if (loading === true) {
    return <Fragment>Loading...</Fragment>;
  }

  const loadMore = (item: OpenSRPJurisdiction, _: Event | React.MouseEvent) => {
    if (!hierarchy.includes(item)) {
      hierarchy.push(item);
    } else {
      // remove all elements in the array that come after item
      // hierarchy should include elements only up to the current item
      hierarchy.length = hierarchy.indexOf(item) + 1;
    }
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
