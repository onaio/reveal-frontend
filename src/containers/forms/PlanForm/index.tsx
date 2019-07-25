import { ErrorMessage, Field, Form, Formik } from 'formik';
import React from 'react';
import { Button, FormGroup, Label } from 'reactstrap';
import * as Yup from 'yup';
import { FIClassifications, FIStatuses } from '../../../configs/settings';
import { REQUIRED, SAVING } from '../../../constants';
import { InterventionType } from '../../../store/ducks/plans';

/** Allowed FI Status values */
type FIStatusType = typeof FIStatuses[number];

/** Array of FI Statuses */
const fiStatusCodes = Object.values(FIClassifications).map(e => e.code as FIStatusType);

/** Yup validation schema for PlanForm */
const PlanSchema = Yup.object().shape({
  fiStatus: Yup.string()
    .oneOf(fiStatusCodes)
    .required(REQUIRED),
  interventionType: Yup.string()
    .oneOf(Object.keys(InterventionType))
    .required(REQUIRED),
});

/** Plan form fields interface */
interface PlanFormFields {
  fiStatus?: FIStatusType;
  interventionType: InterventionType;
}

/** initial values */
const initialValues: PlanFormFields = {
  fiStatus: fiStatusCodes[0],
  interventionType: InterventionType.FI,
};

/** Plan Form component */
const PlanForm = () => {
  return (
    <div className="form-container">
      <Formik
        initialValues={initialValues}
        /* tslint:disable-next-line jsx-no-lambda */
        onSubmit={(values, { setSubmitting }) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            setSubmitting(false);
          }, 400);
        }}
        validationSchema={PlanSchema}
      >
        {({ errors, isSubmitting }) => (
          <Form>
            <FormGroup>
              <Label for="interventionType">Intervention Type</Label>
              <Field
                component="select"
                name="interventionType"
                id="interventionType"
                className={errors.interventionType ? 'form-control is-invalid' : 'form-control'}
              >
                <option value="{InterventionType.FI}">Focus Investigation</option>
                <option value="{InterventionType.IRS}">IRS</option>
              </Field>
              <ErrorMessage
                name="interventionType"
                component="small"
                className="form-text text-danger"
              />
            </FormGroup>
            <FormGroup>
              <Label for="fiStatus">Focus Investigation Status</Label>
              <Field component="select" name="fiStatus" id="fiStatus" className="form-control">
                <option value="{InterventionType.IRS}">IRS</option>
                {Object.entries(FIClassifications).map(e => (
                  <option key={e[1].code} value={e[1].code}>
                    {e[1].code} - {e[1].name}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="fiStatus" component="small" className="form-text text-danger" />
            </FormGroup>
            <Button
              type="submit"
              className="btn btn-block"
              color="primary"
              aria-label="Save Plan"
              disabled={isSubmitting}
            >
              {isSubmitting ? SAVING : 'Save Plan'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PlanForm;
