import { Result } from '@onaio/utils';
import { URLParams } from '@opensrp/server-service/dist/types';
import { OpenSRPService } from '../../services/opensrp';
import { OpenSRPJurisdiction } from './types';

/** Default params to be used when fetching locations from OpenSRP */
export const defaultLocationParams = {
  is_jurisdiction: true,
  return_geometry: false,
};

/** Get ancestors of a jurisdiction from OpenSRP
 *
 * This is a recursive function that traverses the OpenSRP jurisdiction tree
 * upwards (i.e. towards the root parent), and returns an array of all the ancestors
 * of the supplied jurisdiction, including the jurisdiction
 *
 * @param jurisdiction - the jurisdiction in question
 * @param path - array of ancestors
 * @param apiEndpoint - the API endpoint
 * @param serviceClass - the API helper class
 */
export const getAncestors = async (
  jurisdiction: OpenSRPJurisdiction,
  apiEndpoint: string,
  serviceClass: typeof OpenSRPService,
  path: OpenSRPJurisdiction[] = []
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
      return getAncestors(result.value, apiEndpoint, serviceClass, path);
    }
    return result;
  }
};

/** Get children of a jurisdiction from OpenSRP
 *
 * @param jurisdiction - the jurisdiction in question
 * @param path - array of ancestors
 * @param apiEndpoint - the API endpoint
 * @param serviceClass - the API helper class
 */
export const getChildren = async (
  params: URLParams,
  _: OpenSRPJurisdiction | null,
  apiEndpoint: string,
  serviceClass: typeof OpenSRPService
): Promise<Result<OpenSRPJurisdiction[]>> => {
  const service = new serviceClass(apiEndpoint);

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
