import { Result } from '@onaio/utils';
import { uniqBy } from 'lodash';
import { OpenSRPService, URLParams } from '../../services/opensrp';
import {
  ACTIVE,
  COULDNT_LOAD_PARENTS,
  FIND_BY_ID,
  FIND_BY_PROPERTIES,
  LOCATION,
} from './constants';
import { APIEndpoints, OpenSRPJurisdiction, SimpleJurisdiction } from './types';

/** Default params to be used when fetching locations from OpenSRP */
export const defaultLocationParams = {
  is_jurisdiction: true,
  return_geometry: false,
};

/** Default property to be used when fetching locations from OpenSRP */
export const defaultLocationPropertyFilters = {
  status: ACTIVE,
};

export const locationListAPIEndpoints: APIEndpoints = {
  findByJurisdictionIds: FIND_BY_ID,
  findByProperties: FIND_BY_PROPERTIES,
  location: LOCATION,
};

/** Get ancestors of a jurisdiction from OpenSRP
 *
 * This is a recursive function that traverses the OpenSRP jurisdiction tree
 * upwards (i.e. towards the root parent), and returns an array of all the ancestors
 * of the supplied jurisdiction, including the jurisdiction
 *
 * @param jurisdiction - the jurisdiction in question
 * @param path - array of ancestors
 * @param errorMessage - message to show when an error happens
 * @param apiEndpoint - the API endpoint
 * @param serviceClass - the API helper class
 */
export const getAncestors = async (
  jurisdiction: OpenSRPJurisdiction,
  path: OpenSRPJurisdiction[] = [],
  errorMessage: string = COULDNT_LOAD_PARENTS,
  apiEndpoint: string = locationListAPIEndpoints.location,
  serviceClass: typeof OpenSRPService = OpenSRPService
): Promise<Result<OpenSRPJurisdiction[]>> => {
  // Add the jurisdiction to the beginning of the array
  if (!path.map(e => e.id).includes(jurisdiction.id)) {
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
      error: Error(errorMessage),
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
 * @param chunkSize - the number of children to try and get at the same time
 * @param apiEndpoints - the API endpoints to use
 * @param serviceClass - the API helper class  Result<OpenSRPJurisdiction[]
 */
export const getChildren = async (
  params: URLParams,
  jurisdiction: OpenSRPJurisdiction | string | null,
  limitTree: SimpleJurisdiction[] = [],
  chunkSize: number = 20,
  apiEndpoints: APIEndpoints = locationListAPIEndpoints,
  serviceClass: typeof OpenSRPService = OpenSRPService
): Promise<Result<OpenSRPJurisdiction[]>> => {
  let service = new serviceClass(apiEndpoints.findByProperties);

  const promises = [];

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

    // We next want to find relevant jurisdictionIds for the current parent
    // If we do find them, we will ONLY fetch them from
    let jurisdictionIds: string[] = [];
    if (currentParentId) {
      // if we have a currentParentId then we check if limitTree contains any jurisdictions whose parent is currentParentId
      jurisdictionIds = limitTree
        .filter(elem => elem.jurisdiction_parent_id === currentParentId)
        .map(elem => elem.jurisdiction_id);
    } else {
      // if no currentParentId then we check if we have any jurisdictions that have no parent
      jurisdictionIds = limitTree
        .filter(elem => elem.jurisdiction_parent_id === '' || !elem.jurisdiction_parent_id)
        .map(elem => elem.jurisdiction_id);
    }

    if (jurisdictionIds.length > 0) {
      service = new serviceClass(apiEndpoints.findByJurisdictionIds);
      // jurisdictionIds may have a huge number of elements and so we need to chunk
      // it so that our URL doesn't get too long
      for (let index = 0, size = jurisdictionIds.length; index < size; index += chunkSize) {
        params.jurisdiction_ids = jurisdictionIds.slice(index, index + chunkSize).join(',');
        promises.push(service.list(params));
      }
    }
  } else {
    promises.push(service.list(params));
  }

  return Promise.all(promises)
    .then(results => {
      // We are concatenating all the resulting arrays so that we return all nodes in one array
      const children = [].concat.apply([], results);
      // then we remove duplicates and return the children
      return { error: null, value: uniqBy(children, 'id') };
    })
    .catch((error: Error) => {
      return { error, value: null };
    });
};
