import { Result } from '@onaio/utils';
import { OpenSRPService, URLParams } from '../../services/opensrp';
import { APIEndpoints, OpenSRPJurisdiction, SimpleJurisdiction } from './types';

/** Default params to be used when fetching locations from OpenSRP */
export const defaultLocationParams = {
  is_jurisdiction: true,
  return_geometry: false,
};

/** Default property to be used when fetching locations from OpenSRP */
export const defaultLocationPropertyFilters = {
  status: 'Active',
};

export const locationListAPIEndpoints: APIEndpoints = {
  findByJurisdictionIds: 'location/findByJurisdictionIds',
  findByProperties: 'location/findByProperties',
  location: 'location',
};

/** Get ancestors of a jurisdiction from OpenSRP
 *
 * This is a recursive function that traverses the OpenSRP jurisdiction tree
 * upwards (i.e. towards the root parent), and returns an array of all the ancestors
 * of the supplied jurisdiction, including the jurisdiction
 *
 * @param jurisdiction - the jurisdiction in question
 * @param apiEndpoint - the API endpoint
 * @param serviceClass - the API helper class
 * @param path - array of ancestors
 */
export const getAncestors = async (
  jurisdiction: OpenSRPJurisdiction,
  path: OpenSRPJurisdiction[] = [],
  apiEndpoint: string = locationListAPIEndpoints.location,
  serviceClass: typeof OpenSRPService = OpenSRPService
): Promise<Result<OpenSRPJurisdiction[]>> => {
  if (!path.includes(jurisdiction)) {
    path.unshift(jurisdiction);
  }

  if (jurisdiction.properties.geographicLevel === 0 || !jurisdiction.properties.parentId) {
    return {
      error: null,
      value: path,
    };
  }

  const service = new serviceClass(apiEndpoint);

  const result = await service
    .read(jurisdiction.properties.parentId, defaultLocationParams)
    .then((response: OpenSRPJurisdiction) => {
      if (response) {
        return { error: null, value: response };
      }
    })
    .catch((error: Error) => {
      return { error, value: null };
    });

  if (!result) {
    return {
      error: Error('Could get load parents'),
      value: null,
    };
  } else {
    if (result.value !== null) {
      return getAncestors(result.value, path);
    }
    return result;
  }
};

/** Get children of a jurisdiction from OpenSRP
 *
 * @param params - URL params to send with the request to the API
 * @param jurisdiction - the jurisdiction in question
 * @param limitTree - an array that limits the children we try and get from the API
 * @param apiEndpoints - the API endpoints to use
 * @param serviceClass - the API helper class
 */
export const getChildren = async (
  params: URLParams,
  jurisdiction: OpenSRPJurisdiction | string | null,
  limitTree: SimpleJurisdiction[] = [],
  apiEndpoints: APIEndpoints = locationListAPIEndpoints,
  serviceClass: typeof OpenSRPService = OpenSRPService
): Promise<Result<OpenSRPJurisdiction[]>> => {
  let service = new serviceClass(apiEndpoints.findByProperties);

  if (limitTree && limitTree.length > 0) {
    // Basically if limitTree has any elements, then we need to ensure that when
    // getting children from the API, we limit ourselves only to the jurisdictions
    // contained in limitTree

    // first we get the current parent i.e. the one whose children we want
    let currentParentId: string | undefined;
    if (jurisdiction) {
      if (typeof jurisdiction === 'string') {
        currentParentId = jurisdiction;
      } else {
        currentParentId = jurisdiction.id;
      }
    }

    // Next, if limitTree contains any elements whose parent is currentParentId then
    // we only fetch those and not all the children that may possibly be on the API server
    if (currentParentId) {
      const jurisdictionIds = limitTree
        .filter(elem => elem.parentId === currentParentId)
        .map(elem => elem.id);
      if (jurisdictionIds.length > 0) {
        service = new serviceClass(apiEndpoints.findByJurisdictionIds);
        params.jurisdiction_ids = jurisdictionIds.join(',');
      }
    }
  }

  const result = await service
    .list(params)
    .then((response: OpenSRPJurisdiction[]) => {
      if (response) {
        return { error: null, value: response };
      }
    })
    .catch((error: Error) => {
      return { error, value: null };
    });

  if (result && result.value !== null) {
    return result;
  }

  return result === undefined
    ? {
        error: Error('Could get load children'),
        value: null,
      }
    : result;
};
