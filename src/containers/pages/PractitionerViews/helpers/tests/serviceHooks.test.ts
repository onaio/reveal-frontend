import flushPromises from 'flush-promises';
import { practitioners } from '../../../../../components/forms/PractitionerForm/UserIdSelect/tests/fixtures';
import { OPENSRP_PRACTITIONER_ENDPOINT } from '../../../../../constants';
import { practitioner1 } from '../../../../../store/ducks/tests/fixtures';
import { loadPractitioner, loadPractitioners } from '../serviceHooks';

describe('src/containers/pages/PractitionerViews/serviceHooks', () => {
  it('loadPractitioner works correctly', async () => {
    const mockRead = jest.fn(async () => practitioner1);
    const mockActionCreator = jest.fn();
    const mockClass = jest.fn().mockImplementation(() => {
      return {
        read: mockRead,
      };
    });

    loadPractitioner('practitionerId', mockClass, mockActionCreator).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_PRACTITIONER_ENDPOINT);

    // Uses the correct service method
    expect(mockRead).toHaveBeenCalledWith('practitionerId');

    // calls action creator correctly.
    expect(mockActionCreator).toHaveBeenCalledWith([practitioner1]);
  });

  it('loadPractitioners works correctly', async () => {
    const mockList = jest.fn(async () => practitioners);
    const mockActionCreator = jest.fn();
    const mockClass = jest.fn().mockImplementation(() => {
      return {
        list: mockList,
      };
    });

    loadPractitioners(mockClass, mockActionCreator).catch(e => {
      throw e;
    });
    await flushPromises();

    // calls the correct endpoint
    expect(mockClass).toHaveBeenCalledWith(OPENSRP_PRACTITIONER_ENDPOINT);

    // Uses the correct service method
    expect(mockList).toHaveBeenCalledTimes(1);

    // calls action creator correctly.
    expect(mockActionCreator).toHaveBeenCalledWith(practitioners, true);
  });
});
