import { toast } from 'react-toastify';
import { OPENSRP_PRACTITIONER_ENDPOINT } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { growl } from '../../../../helpers/utils';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import { fetchPractitioners, Practitioner } from '../../../../store/ducks/opensrp/practitioners';

/** loads all practitioners returned in within a single request from practitioners endpoint
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 * @param {typeof fetchPractitioners} fetchPractitionersActionCreator - action creator for adding practitioners to store
 */
export const loadPractitioners = async (
  service: typeof OpenSRPService = OpenSRPService,
  fetchPractitionersCreator: any
) => {
  const serve = new service(OPENSRP_PRACTITIONER_ENDPOINT);
  serve
    .list()
    .then((response: Practitioner[]) => store.dispatch(fetchPractitionersCreator(response, true)))
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
};

/** load a single practitioner given his/her id
 * @param {string} practitionerId - id of practitioner
 * @param {typeof OpenSRPService} service -  the OpenSRP service
 * @param {typeof fetchPractitioners} fetchPractitionersActionCreator - action creator for adding practitioners to store
 */
export const loadPractitioner = async (
  practitionerId: string,
  service: typeof OpenSRPService = OpenSRPService,
  fetchPractitionersCreator: typeof fetchPractitioners
) => {
  const serve = new service(OPENSRP_PRACTITIONER_ENDPOINT);
  serve
    .read(practitionerId)
    .then((response: Practitioner) => store.dispatch(fetchPractitionersCreator([response])))
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
};

/**
 * load all practioners with pagination
 * @param { typeof OpenSRPService } serviceClass -  the OpenSRP service
 * @param { number } pageSize - number of records per page
 * @param { number } pageNumber - page to fetch records from
 * @param { boolean } getAll - determine if to get all availble pages recusively
 */
export const getAllPractitioners = (
  serviceClass: typeof OpenSRPService,
  pageSize: number = 1000,
  pageNumber: number = 1,
  getAll: boolean = false
) => {
  const service = new serviceClass(OPENSRP_PRACTITIONER_ENDPOINT);

  const getPractitionersByPage = (currentPage: number, results: Practitioner[] = []) => {
    const filterParamss = {
      pageNumber: currentPage,
      pageSize,
    };
    if (results.length || pageNumber === currentPage) {
      return service
        .list(filterParamss)
        .then((res: Practitioner[]) => {
          if (res && res.length) {
            store.dispatch(fetchPractitioners(res));
          }
          if (getAll) {
            const newPage = ++currentPage;
            // tslint:disable-next-line: no-floating-promises
            getPractitionersByPage(newPage, res);
          }
        })
        .catch(err => displayError(err));
    } else {
      return Promise.resolve();
    }
  };

  return getPractitionersByPage(pageNumber);
};
