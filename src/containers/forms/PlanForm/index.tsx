import { ErrorMessage, Field, Form, Formik } from 'formik';
import React from 'react';
import { Button, FormGroup, Label } from 'reactstrap';
import { InterventionType } from '../../../store/ducks/plans';

/** Plan Form component */
const PlanForm = () => {
  return (
    <div className="form-container">
      <Formik
        initialValues={{ interventionType: InterventionType.FI }}
        /* tslint:disable-next-line jsx-no-lambda */
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            setSubmitting(false);
          }, 400);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormGroup>
              <Label for="interventionType">Intervention Type</Label>
              <Field
                component="select"
                name="interventionType"
                id="interventionType"
                className="form-control"
              >
                <option value="{InterventionType.FI}">FI</option>
                <option value="{InterventionType.IRS}">IRS</option>
              </Field>
              <ErrorMessage
                name="interventionType"
                component="small"
                className="form-text text-danger"
              />
            </FormGroup>
            <Button
              type="submit"
              className="btn btn-block"
              color="primary"
              aria-label="Save Plan"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving' : 'Save Plan'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PlanForm;
