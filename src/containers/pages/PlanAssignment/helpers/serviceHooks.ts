import moment from 'moment';
import { COULD_NOT_LOAD_ASSIGNMENTS } from '../../../../configs/lang';
import { OPENSRP_GET_ASSIGNMENTS_ENDPOINT } from '../../../../constants';
import { displayError } from '../../../../helpers/errors';
import { OpenSRPService } from '../../../../services/opensrp';
import { Assignment, fetchAssignments } from '../../../../store/ducks/opensrp/assignments';
import { AssignmentResponse } from './types';

export interface GetAllAssignmentsOptions {
  getAll: boolean;
  pageSize?: number;
  pageNumber?: number;
}

export const ProcessReceivedAssignments = (data: AssignmentResponse[]): Assignment[] =>
  data.map(assignment => {
    return {
      fromDate: moment(assignment.fromDate).format(),
      jurisdiction: assignment.jurisdictionId,
      organization: assignment.organizationId,
      plan: assignment.planId,
      toDate: moment(assignment.toDate).format(),
    };
  });

export const getAllAssignments = (
  serviceClass: typeof OpenSRPService,
  plan: string,
  fetchAssignmentsActionCreator: typeof fetchAssignments,
  { getAll = false, pageSize = 1, pageNumber = 1 }: GetAllAssignmentsOptions
) => {
  const service = new serviceClass(OPENSRP_GET_ASSIGNMENTS_ENDPOINT);

  const getAssignmentsByPage = (currentPage: number) => {
    const filterParamss = {
      pageNumber: currentPage,
      pageSize,
      plan,
    };
    return service
      .list(filterParamss)
      .then((res: AssignmentResponse[]) => {
        if (res) {
          // save assignemnts to store
          fetchAssignmentsActionCreator(ProcessReceivedAssignments(res));
        } else {
          displayError(Error(COULD_NOT_LOAD_ASSIGNMENTS));
        }
        if (getAll && res && res.length) {
          const newPage = ++currentPage;
          // tslint:disable-next-line: no-floating-promises
          getAssignmentsByPage(newPage);
        }
      })
      .catch(err => displayError(err));
  };

  return getAssignmentsByPage(pageNumber);
};
