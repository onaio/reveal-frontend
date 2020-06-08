import { Page } from '../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import { MDA_POINT_SCHOOL_REPORT_TITLE } from '../../../../configs/lang';
import { REPORT_MDA_POINT_PLAN_URL } from '../../../../constants';
import { SchoolReport } from '../../../../store/ducks/generic/MDASchoolReport';

interface ReturnPagedata {
  pageTitle: string;
  prevPage: Page;
}

export const getPrevPageAndTitle = (school: SchoolReport): ReturnPagedata => {
  const depth = school.jurisdiction_depth;
  const prevPage = {
    label: school.jurisdiction_name_path[depth - 1],
    url: `${REPORT_MDA_POINT_PLAN_URL}/${school.plan_id}/${school.jurisdiction_id_path[depth - 1]}`,
  };
  const pageTitle = `${MDA_POINT_SCHOOL_REPORT_TITLE}: ${school.jurisdiction_name_path[depth]}`;
  return {
    pageTitle,
    prevPage,
  };
};
