/** renders a form inline, containing search field and search button */
import { Field, Form, Formik } from 'formik';
import React from 'react';
import { Button, FormGroup } from 'reactstrap';
import { SEARCH } from '../../constants';

/** Interface describing the form fields data */
export interface FieldProps {
  searchText: string;
}

/** default/initial values for the form fields */
const defaultInitialValues: FieldProps = {
  searchText: '',
};

/** Props for inlineSearch component */
export interface Props {
  handleSubmit?: (values: FieldProps) => void;
  inputId: string;
  inputPlaceholder: string;
}

/** default values for props for this component */
const defaultProps: Props = {
  inputId: 'search',
  inputPlaceholder: 'Search',
};

/** the InlineSearchForm component */
const InlineSearchForm = (props: Props) => {
  const { handleSubmit, inputPlaceholder, inputId } = props;
  return (
    <Formik
      initialValues={defaultInitialValues}
      // tslint:disable-next-line: jsx-no-lambda
      onSubmit={values => {
        if (handleSubmit !== undefined) {
          handleSubmit(values);
        }
      }}
    >
      <Form className="form-inline">
        <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
          <Field type="text" name="searchText" id={inputId} placeholder={inputPlaceholder} />
        </FormGroup>
        <Button type="submit" outline={true} id="submit" color="success">
          {SEARCH}
        </Button>
      </Form>
    </Formik>
  );
};

InlineSearchForm.defaultProps = defaultProps;

export default InlineSearchForm;
