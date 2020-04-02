import { cleanup, fireEvent, queryByText, render, waitFor } from '@testing-library/react';
import React from 'react';
import TeamForm, { submitForm } from '..';
import * as helperUtils from '../../../../helpers/utils';
import * as fixtures from '../../../../store/ducks/tests/fixtures';

afterEach(cleanup);
describe('components/forms/OrganizationForm', () => {
  it('renders without crashing', () => {
    render(<TeamForm />);
  });

  it('renders team form correctly', () => {
    /** emphasizes on fields showing up  */
    const { container } = render(<TeamForm />);

    expect(container.querySelector('input[name="name"]')).toMatchSnapshot('Team name');

    expect(container.querySelector('input[id="yes"]')).toMatchSnapshot('Active');

    expect(container.querySelector('input[id="no"]')).toMatchSnapshot('Not active');

    expect(container.querySelector('button')).toMatchSnapshot('Submit Button');
    /** should always be null unless on edit view */
    expect(container.querySelector('input#identifier')).toMatchSnapshot('Null Identifier');
  });

  it('renders fields correctly in edit mode', () => {
    const props = {
      initialValues: fixtures.organization1,
    };
    const { container } = render(<TeamForm {...props} />);
    /** Team name Input should have a value in edit view */
    const teamName = container.querySelector('input[name="name"]');
    expect(teamName && teamName.getAttribute('value')).toBe('The Luang');
  });

  it('form validation works', async () => {
    const { container, getByText, getByTestId } = render(<TeamForm />);
    fireEvent.submit(getByTestId('form'));
    /** Assert Validation Response and Button disable */
    await waitFor(() => {
      expect(queryByText(container, 'Required')).not.toBeNull();
      expect(getByText('Save Team')).toBeDisabled();
    });
  });
  it('submitForm create a team', async () => {
    const setSubmitting = jest.fn();
    const setGlobalError = jest.fn();
    const setIfDoneHere = jest.fn();
    const mockGrowl: any = jest.fn().mockName('onClose');
    (helperUtils as any).growl = mockGrowl;
    const mockedOpenSRPservice = jest.fn().mockImplementation(() => {
      return {
        create: () => {
          return Promise.resolve({});
        },
      };
    });
    const props = {
      OpenSRPService: mockedOpenSRPservice,
      initialValues: fixtures.organization1,
    };
    submitForm(
      setSubmitting,
      false,
      setGlobalError,
      setIfDoneHere,
      props as any,
      fixtures.createOrganizationFormObject
    );
    await waitFor(() => {
      expect(mockedOpenSRPservice).toHaveBeenCalledTimes(1);
      expect(mockGrowl).toBeCalled();
      expect(mockGrowl.mock.calls[0][1].type).toEqual('success');
    });
  });
  it('submitForm update team', async () => {
    const setSubmitting = jest.fn();
    const setGlobalError = jest.fn();
    const setIfDoneHere = jest.fn();
    const mockGrowl: any = jest.fn().mockName('onClose');
    (helperUtils as any).growl = mockGrowl;
    const mockedOpenSRPservice = jest.fn().mockImplementation(() => {
      return {
        update: () => {
          return Promise.resolve({});
        },
      };
    });
    const props = {
      OpenSRPService: mockedOpenSRPservice,
      initialValues: fixtures.organization1,
    };
    submitForm(
      setSubmitting,
      true,
      setGlobalError,
      setIfDoneHere,
      props as any,
      fixtures.createOrganizationFormObject
    );
    await waitFor(() => {
      expect(mockedOpenSRPservice).toHaveBeenCalledTimes(1);
      expect(mockGrowl.mock.calls[0][1].type).toEqual('success');
      expect(mockGrowl).toBeCalled();
    });
  });
  it('calles submission handler', async () => {
    // Here's my submitHandler mock that isn't getting called
    // const mockedsubmitForm = jest.fn();
    const mockOpenSRPService = jest.fn().mockImplementation(() => {
      return {
        create: () => {
          return Promise.resolve({});
        },
      };
    });
    const mockedsubmitForm = jest.fn();
    const props = {
      OpenSRPService: mockOpenSRPService,
      initialValues: fixtures.organization1,
      submitForm: mockedsubmitForm,
    };
    const wrapper = render(<TeamForm {...props} />);
    const emailNode = wrapper.getByTestId('name') as HTMLInputElement;
    const loginButtonNode = wrapper.getByText('Save Team') as HTMLInputElement;
    // Act--------------
    // Change the input values
    fireEvent.change(emailNode, { target: { value: 'Akuko' } });
    // This should submit the form?
    fireEvent.click(loginButtonNode);
    // Assert--------------
    await waitFor(() => {
      expect(mockedsubmitForm).toHaveBeenCalledTimes(1);
    });
  });
});
