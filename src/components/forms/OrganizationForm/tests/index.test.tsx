import { fireEvent, queryByText, render, waitFor, waitForElement } from '@testing-library/react';
import { Field, Form, Formik } from 'formik';
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
  it('submits values and fires handler', async () => {
    const mock = jest.fn();
    const { getByText, getByTestId } = render(
      <Formik initialValues={{ name: '' }} onSubmit={mock}>
        <Form>
          <Field name="name" data-testid="Input" />
          <button type="submit">Submit</button>
        </Form>
      </Formik>
    );
    const input = await waitForElement(() => getByTestId('Input'));
    const button = await waitForElement(() => getByText('Submit'));
    fireEvent.change(input, {
      target: {
        value: 'Akuko',
      },
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(mock).toBeCalled();
      expect(mock.mock.calls[0][0].name).toBe('Akuko');
    });
  });
});
