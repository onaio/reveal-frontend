// import { toBeDisabled } from '@testing-library/jest-dom/matchers';
// import { toBeInTheDocument, toHaveClass } from '@testing-library/jest-dom/matchers';
import { fireEvent, queryByText, render, waitFor } from '@testing-library/react';
import React from 'react';
import Teamform from '..';
import TeamForm from '..';
import * as fixtures from '../../../../store/ducks/tests/fixtures';

describe('components/forms/OrganizationForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders without crashing', () => {
    render(<Teamform />);
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
  it('submits correct values', async () => {
    const { container } = render(<TeamForm />);
    const teamName = container.querySelector('input[name="name"]');
    const teamStatus = container.querySelector('input[name="active"]');
    const submit = container.querySelector('button[type="submit"]');

    if (teamName && teamStatus && submit) {
      // teamName && await wait(() => {
      fireEvent.change(teamName, {
        target: {
          value: 'mockname',
        },
      });
      // });
      // teamStatus && await wait(() => {
      fireEvent.change(teamStatus, {
        target: {
          value: 'yes',
        },
      });
      // });
      // submit && await wait(() => {
      fireEvent.click(submit);
      // });
      expect(teamName.getAttribute('value')).toBe('mockname');
      expect(teamStatus.getAttribute('value')).toBe('yes');
      // expect(submitHandler).toBeCalled();
      // await wait(() => {
      //   expect(teamName.getAttribute('value')).toBe('mockname');
      //   expect(teamStatus.getAttribute('value')).toBe('no');
      //   expect(handleSubmit).toHaveBeenCalledTimes(1);
      // });
    }
  });
});
