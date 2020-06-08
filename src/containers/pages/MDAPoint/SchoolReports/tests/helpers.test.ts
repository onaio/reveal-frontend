import { MDA_POINT_SCHOOL_REPORT_TITLE } from '../../../../../configs/lang';
import { REPORT_MDA_POINT_PLAN_URL } from '../../../../../constants';
import { MDAPointSchoolReportData } from '../../../../../store/ducks/generic/tests/fixtures';
import { getPrevPageAndTitle } from '../helpers';

describe('containers/pages/MDAPoint/SchoolReports/helpers', () => {
  it('shoul return correct page title and previous page details', () => {
    const pageTitle = `${MDA_POINT_SCHOOL_REPORT_TITLE}: Akros_1`;
    const prevPage = {
      label: 'Mtendere',
      url: `${REPORT_MDA_POINT_PLAN_URL}/40357eff-81b6-4e32-bd3d-484019689f7c/3019`,
    };
    expect(getPrevPageAndTitle(MDAPointSchoolReportData[0])).toEqual({ pageTitle, prevPage });
  });
});
