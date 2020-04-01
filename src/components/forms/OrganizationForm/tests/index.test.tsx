import { cleanup, fireEvent, queryByText, render, waitFor } from '@testing-library/react';
import React from 'react';
import Teamform from '..';
import * as fixtures from '../../../../store/ducks/tests/fixtures';

afterEach(cleanup);
describe('components/forms/OrganizationForm', () => {
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
  it('handleSubmit create a team', () => {
    // handleSubmit(() => {}, );
  });
  it('calles submission handler', async () => {
    let submitForm: () => void;
    // Here's my submitHandler mock that isn't getting called
    submitForm = jest.fn();
    const props = {
      initialValues: fixtures.organization1,
      submitForm,
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
      expect(submitForm).toHaveBeenCalledTimes(1);
    });
  });
});
