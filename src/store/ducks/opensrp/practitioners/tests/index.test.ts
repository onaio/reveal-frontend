/** Test file for the practitioners ducks module */
import reducerRegistry from '@onaio/redux-reducer-registry';
import { keyBy, values } from 'lodash';
import reducer, {
  fetchPractitioners,
  getPractitionersArray,
  getPractitionersById,
  makePractitionersSelector,
  Practitioner,
  reducerName,
  removePractitionersAction,
} from '..';
import store from '../../../..';
import * as fixtures from '../../../tests/fixtures';

reducerRegistry.register(reducerName, reducer);

const generateKeyBy = (practitioners: Practitioner[]) =>
  keyBy(practitioners, practitioner => practitioner.identifier);

const practitionersSelector = makePractitionersSelector();

describe('reducers/practitioners.reducer- integration test', () => {
  beforeEach(() => {
    store.dispatch(removePractitionersAction);
  });

  it('fetchedPractitioners actions actually adds data to store', () => {
    expect(getPractitionersById(store.getState())).toEqual({});
    expect(getPractitionersArray(store.getState())).toEqual([]);
    store.dispatch(fetchPractitioners([fixtures.practitioner1, fixtures.practitioner2]));
    expect(getPractitionersById(store.getState())).toEqual({
      'd7c9c000-e9b3-427a-890e-49c301aa48e6': fixtures.practitioner2,
      p5id: fixtures.practitioner1,
    });
    expect(getPractitionersArray(store.getState())).toEqual(
      values([fixtures.practitioner1, fixtures.practitioner2])
    );
  });

  it('removePractitioners action removes practitioners', () => {
    store.dispatch(fetchPractitioners([fixtures.practitioner1, fixtures.practitioner2]));
    let numberOfPractitioners = getPractitionersArray(store.getState()).length;
    expect(numberOfPractitioners).toEqual(2);

    store.dispatch(removePractitionersAction);
    numberOfPractitioners = getPractitionersArray(store.getState()).length;
    expect(numberOfPractitioners).toEqual(0);
  });

  it('Adds new practitioners to store instead of overwriting existing ones', () => {
    store.dispatch(removePractitionersAction);
    store.dispatch(fetchPractitioners([fixtures.practitioner1]));
    let numberOfPractitioners = getPractitionersArray(store.getState()).length;
    expect(numberOfPractitioners).toEqual(1);

    store.dispatch(fetchPractitioners([fixtures.practitioner2]));
    numberOfPractitioners = getPractitionersArray(store.getState()).length;
    expect(numberOfPractitioners).toEqual(2);
  });

  it('overwrites stored practitioners when overwrite is true', () => {
    store.dispatch(removePractitionersAction);
    store.dispatch(fetchPractitioners([fixtures.practitioner1]));
    let numberOfPractitioners = getPractitionersArray(store.getState()).length;
    expect(numberOfPractitioners).toEqual(1);

    store.dispatch(fetchPractitioners([fixtures.practitioner2], true));
    numberOfPractitioners = getPractitionersArray(store.getState()).length;
    expect(numberOfPractitioners).toEqual(1);
  });

  it('fetchedPractitionerRole actions actually adds data to store', () => {
    expect(getPractitionersById(store.getState())).toEqual({});
    expect(getPractitionersArray(store.getState())).toEqual([]);

    store.dispatch(
      fetchPractitioners(fixtures.org3Practitioners, false, fixtures.organization3.identifier)
    );
    expect(getPractitionersById(store.getState())).toEqual(
      generateKeyBy(fixtures.org3Practitioners)
    );
    expect(
      practitionersSelector(store.getState(), { organizationId: fixtures.organization3.identifier })
        .length
    ).toEqual(3);
    expect(
      practitionersSelector(store.getState(), { organizationId: 'nonExistingOrgId' }).length
    ).toEqual(0);

    expect(practitionersSelector(store.getState(), { name: 'v2_nam' })).toEqual([
      fixtures.practitioner4,
    ]);
    expect(
      practitionersSelector(store.getState(), { identifiers: [fixtures.practitioner4.identifier] })
    ).toEqual([fixtures.practitioner4]);
  });

  it('removePractitionerRole action removes practitioners', () => {
    store.dispatch(
      fetchPractitioners(fixtures.org3Practitioners, false, fixtures.organization3.identifier)
    );

    let org3Practs = practitionersSelector(store.getState(), {
      organizationId: fixtures.organization3.identifier,
    }).length;
    expect(org3Practs).toEqual(3);

    store.dispatch(removePractitionersAction);
    org3Practs = practitionersSelector(store.getState(), {
      organizationId: fixtures.organization3.identifier,
    }).length;
    expect(org3Practs).toEqual(0);
  });

  it('Adds new practitioners to store instead of overwriting existing ones', () => {
    // impact on practitionersById
    store.dispatch(
      fetchPractitioners([fixtures.practitioner4], false, fixtures.organization3.identifier)
    );

    let org3Practs = practitionersSelector(store.getState(), {
      organizationId: fixtures.organization3.identifier,
    }).length;
    expect(org3Practs).toEqual(1);

    // possibilities; adding practitioners to the same organization should override
    store.dispatch(
      fetchPractitioners([fixtures.practitioner5], false, fixtures.organization3.identifier)
    );

    org3Practs = practitionersSelector(store.getState(), {
      organizationId: fixtures.organization3.identifier,
    }).length;
    expect(org3Practs).toEqual(1);

    // possibilities; adding same practitioners to a different organization
    store.dispatch(
      fetchPractitioners([fixtures.practitioner5], false, fixtures.organization2.identifier)
    );

    let org2Practs = practitionersSelector(store.getState(), {
      organizationId: fixtures.organization2.identifier,
    }).length;
    expect(org2Practs).toEqual(1);

    // possibilities; adding practitioners to a different organization
    store.dispatch(
      fetchPractitioners([fixtures.practitioner6], false, fixtures.organization1.identifier)
    );

    const org1Practs = practitionersSelector(store.getState(), {
      organizationId: fixtures.organization1.identifier,
    }).length;

    org2Practs = practitionersSelector(store.getState(), {
      organizationId: fixtures.organization2.identifier,
    }).length;
    org3Practs = practitionersSelector(store.getState(), {
      organizationId: fixtures.organization3.identifier,
    }).length;
    expect(org1Practs).toEqual(1);
    expect(org2Practs).toEqual(1);
    expect(org3Practs).toEqual(1);
  });
});
