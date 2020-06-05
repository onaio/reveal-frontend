/** tests for Organization page views api calling functions */
import flushPromises from 'flush-promises';
import {
  OPENSRP_ORG_PRACTITIONER_ENDPOINT,
  OPENSRP_ORGANIZATION_ENDPOINT,
} from '../../../../../constants';
import * as fixtures from '../../../../../store/ducks/tests/fixtures';
import { loadOrganization, loadOrganizations, loadOrgPractitioners } from '../serviceHooks';

describe('src/containers/pages/OrganizationViews/helpers/servicehooks', () => {
  it('loadOrganization works correctly', async () => {
    const mockRead = jest.fn(async () => fixtures.organization1);
    const mockActionCreator = jest.fn();
    const mockClass = jest.fn().mockImplementation(() => {
      return {
        read: mockRead,
      };
    });

    loadOrganization('organizationId', mockClass, mockActionCreator).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_ORGANIZATION_ENDPOINT);

    // Uses the correct service method
    expect(mockRead).toHaveBeenCalledWith('organizationId');

    // calls action creator correctly.
    expect(mockActionCreator).toHaveBeenCalledWith([fixtures.organization1]);
  });

  it('loadOrgPractitioners works correctly', async () => {
    const mockRead = jest.fn(async () => fixtures.org3Practitioners);
    const fetchPractitionersMock = jest.fn();
    const mockClass = jest.fn().mockImplementation(() => {
      return {
        read: mockRead,
      };
    });

    loadOrgPractitioners('organization3Id', mockClass, fetchPractitionersMock).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_ORG_PRACTITIONER_ENDPOINT);

    // Uses the correct service method
    expect(mockRead).toHaveBeenCalledWith('organization3Id');

    // calls action creator correctly.
    expect(fetchPractitionersMock).toHaveBeenCalledWith(
      fixtures.org3Practitioners,
      false,
      'organization3Id'
    );
  });

  it('loadOrganizations works correctly', async () => {
    const mockList = jest.fn(async () => fixtures.organizations);
    const mockActionCreator = jest.fn();
    const mockClass = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });

    loadOrganizations(mockClass, mockActionCreator).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_ORGANIZATION_ENDPOINT);

    // Uses the correct service method
    expect(mockList).toHaveBeenCalledTimes(1);

    // calls action creator correctly.
    expect(mockActionCreator).toHaveBeenCalledWith(fixtures.organizations, true);
  });
});
