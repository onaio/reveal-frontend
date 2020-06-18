import { Result } from '@onaio/utils';
import { OpenSRPService } from '../../services/opensrp';
import { OpenSRPJurisdiction } from './types';

export const defaultParams = {
  is_jurisdiction: true,
  return_geometry: false,
};

export const getAncestors = async (
  jurisdiction: OpenSRPJurisdiction,
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

  const service = new OpenSRPService('location');
  const result = await service
    .read(jurisdiction.properties.parentId, defaultParams)
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
      error: Error('Could not load parents'),
      value: null,
    };
  } else {
    if (result.value !== null) {
      return getAncestors(result.value, path);
    }
    return result;
  }
};
