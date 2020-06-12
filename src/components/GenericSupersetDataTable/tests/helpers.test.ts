import superset from '@onaio/superset-connector';
import { MDAPointJurisdictionsJSON } from '../../../containers/pages/MDAPoint/jurisdictionsReport/tests/fixtures';
import { GenericJurisdiction } from '../../../store/ducks/generic/jurisdictions';
import { buildBreadCrumbs } from '../helpers';

describe('LocationReports/helpers', () => {
  it('should return correct data', () => {
    const jurisdictionData = superset.processData(MDAPointJurisdictionsJSON);
    const results = buildBreadCrumbs(
      [jurisdictionData] as GenericJurisdiction[][],
      '40357eff-81b6-4e32-bd3d-484019689f7c',
      '3951'
    );
    expect(results.prevPages).toEqual([
      {
        label: 'Lusaka',
        url: '/intervention/mda-point/report/40357eff-81b6-4e32-bd3d-484019689f7c/2942',
      },
      {
        label: 'Mtendere',
        url: '/intervention/mda-point/report/40357eff-81b6-4e32-bd3d-484019689f7c/3019',
      },
    ]);
    expect(results.pTitle).toEqual('Akros_1');
  });
});
