import superset from '@onaio/superset-connector';
import { cloneDeep } from 'lodash';
import { MDAJurisdictionsJSON } from '../../DynamicMDA/JurisdictionsReport/tests/fixtures';
import * as fixtures from '../../IRS/JurisdictionsReport/fixtures';
import * as helpers from '../helpers';
import { getColumnsToUse } from '../helpers';

describe('containers/pages/IRS/JurisdictionsReport/helpers', () => {
  it('should return the correct columns for Namibia', () => {
    expect(JSON.stringify(helpers.NamibiaColumns)).toEqual(JSON.stringify(fixtures.NamibiaColumns));
  });

  it('should return the correct columns for Zambia focus areas', () => {
    expect(JSON.stringify(helpers.ZambiaFocusAreasColumns)).toEqual(
      JSON.stringify(fixtures.ZambiaFocusAreasColumns)
    );
  });

  it('should return the correct columns for Zambia jurisdiction', () => {
    expect(JSON.stringify(helpers.ZambiaJurisdictionsColumns)).toEqual(
      JSON.stringify(fixtures.ZambiaJurisdictionsColumns)
    );
  });

  it('should return the correct keys for plansTableColumns', () => {
    expect(Object.keys(helpers.plansTableColumns)).toEqual([
      'irsLiteZambiaFocusArea2020',
      'irsLiteZambiaJurisdictions2020',
      'mdaJurisdictionsColumns',
      'mdaLiteJurisdictionsColumns',
      'namibia2019',
      'smcJurisdictionsColumns',
      'zambiaFocusArea2019',
      'zambiaJurisdictions2019',
      'zambiaMDALower2020',
      'zambiaMDAUpper2020',
    ]);
  });
  it('it should return the correct table columns for plansTableColumns namibia2019', () => {
    expect(JSON.stringify(helpers.plansTableColumns.namibia2019)).toEqual(
      JSON.stringify(fixtures.NamibiaColumns)
    );
  });

  it('should return the correct table columns for plansTableColumns zambiaFocusArea2019', () => {
    expect(JSON.stringify(helpers.plansTableColumns.zambiaFocusArea2019)).toEqual(
      JSON.stringify(fixtures.ZambiaFocusAreasColumns)
    );
  });

  it('should return the correct columns for plansTableColumns zambiaJurisdictions2019', () => {
    expect(JSON.stringify(helpers.plansTableColumns.zambiaJurisdictions2019)).toEqual(
      JSON.stringify(fixtures.ZambiaJurisdictionsColumns)
    );
  });

  it('should return the correct columns for MDA point', () => {
    expect(JSON.stringify(helpers.mdaJurisdictionsColumns)).toEqual(
      JSON.stringify(fixtures.mdaPointColumns)
    );
  });

  it('getColumnsToUse: should return correct columns', () => {
    const jurisdiction = superset.processData(MDAJurisdictionsJSON) || [];
    const jurisdictionColumn = 'zambiaMDAUpper2020';
    const focusAreaColumn = 'zambiaMDALower2020';
    const focusAreaLevel = '2';
    let jurisdictionId = '4669b841-5f06-47bc-ac87-4282ca21ae6a';
    // jurisdiction_depth of 2
    expect(
      getColumnsToUse(
        jurisdiction,
        jurisdictionColumn,
        focusAreaColumn,
        focusAreaLevel,
        jurisdictionId
      )
    ).toEqual(helpers.zambiaMDALowerJurisdictions);
    // jurisdiction_depth of 1
    jurisdictionId = 'ecfbf048-fb7a-47d8-a12b-61bf5d2a6e7b';
    expect(
      getColumnsToUse(
        jurisdiction,
        jurisdictionColumn,
        focusAreaColumn,
        focusAreaLevel,
        jurisdictionId
      )
    ).toEqual(helpers.zambiaMDAUpperJurisdictions);
  });

  it('getColumnsToUse: should work with "is_leaf_node"', () => {
    const jurisdictions = superset.processData(fixtures.ZambiaJurisdictionsJSON) || [];
    const focusAreas = superset.processData(fixtures.ZambiaFocusAreasJSON) || [];
    const jurisdictionColumn = 'zambiaJurisdictions2019';
    const focusAreaColumn = 'zambiaFocusArea2019';
    // lets test cases where "is_focus_area" is defined in the data
    expect(
      getColumnsToUse(
        jurisdictions.concat(focusAreas),
        jurisdictionColumn,
        focusAreaColumn,
        '-1', // --> something that actually cant work if "is_focus_area" fails
        'ee21d269-1179-4d04-aea9-900155f890cd'
      )
    ).toEqual(helpers.ZambiaJurisdictionsColumns);
    expect(
      getColumnsToUse(
        jurisdictions.concat(focusAreas),
        jurisdictionColumn,
        focusAreaColumn,
        '-1', // --> something that actually cant work if "is_focus_area" fails
        '4bcbad9e-77cd-47df-8674-fdf0fdf2d831'
      )
    ).toEqual(helpers.ZambiaFocusAreasColumns);
    // now lets make the first record a virtual jurisdiction
    const randomJurisdiction = cloneDeep(jurisdictions[0]);
    randomJurisdiction.id = '1337';
    randomJurisdiction.is_virtual_jurisdiction = true;
    randomJurisdiction.jurisdiction_parent_id = '4bcbad9e-77cd-47df-8674-fdf0fdf2d831';
    expect(
      getColumnsToUse(
        [randomJurisdiction].concat(jurisdictions.concat(focusAreas)),
        jurisdictionColumn,
        focusAreaColumn,
        '-1', // --> something that actually cant work if "is_focus_area" fails
        '4bcbad9e-77cd-47df-8674-fdf0fdf2d831'
      )
    ).toEqual(helpers.ZambiaFocusAreasColumns);
  });
});
