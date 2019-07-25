import { ErrorMessage, Field, Form, Formik } from 'formik';
import React from 'react';
import { Button, FormGroup, Label } from 'reactstrap';
import * as Yup from 'yup';
import { FIClassifications, FIReasons, FIStatuses } from '../../../configs/settings';
import { IS, NAME, REQUIRED, SAVING } from '../../../constants';
import { InterventionType, PlanStatus } from '../../../store/ducks/plans';

/** Allowed FI Status values */
type FIStatusType = typeof FIStatuses[number];

/** Allowed FI Status values */
type FIReasonType = typeof FIReasons[number];

/** Array of FI Statuses */
const fiStatusCodes = Object.values(FIClassifications).map(e => e.code as FIStatusType);

/** Yup validation schema for PlanForm */
const PlanSchema = Yup.object().shape({
  caseNum: Yup.string(),
  fiReason: Yup.string().oneOf(FIReasons.map(e => e)),
  fiStatus: Yup.string().oneOf(fiStatusCodes),
  interventionType: Yup.string()
    .oneOf(Object.values(InterventionType))
    .required(REQUIRED),
  name: Yup.string().required(`${NAME} ${IS} ${REQUIRED}`),
  opensrpEventId: Yup.string(),
  status: Yup.string()
    .oneOf(Object.values(PlanStatus))
    .required(REQUIRED),
  title: Yup.string().required(REQUIRED),
});

/** Plan form fields interface */
interface PlanFormFields {
  caseNum?: string;
  fiReason?: FIReasonType;
  fiStatus?: FIStatusType;
  interventionType: InterventionType;
  name: string;
  opensrpEventId?: string;
  status: PlanStatus;
  title: string;
}

/** initial values */
const initialValues: PlanFormFields = {
  caseNum: undefined,
  fiReason: undefined,
  fiStatus: undefined,
  interventionType: InterventionType.FI,
  name: '',
  opensrpEventId: undefined,
  status: PlanStatus.DRAFT,
  title: '',
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
            <FormGroup className="non-field-errors">
              <ErrorMessage name="name" component="p" className="form-text text-danger" />
            </FormGroup>
            <FormGroup>
              <Label for="interventionType">Intervention Type</Label>
              <Field
                component="select"
                name="interventionType"
                id="interventionType"
                className={errors.interventionType ? 'form-control is-invalid' : 'form-control'}
              >
                <option value={InterventionType.FI}>Focus Investigation</option>
                <option value={InterventionType.IRS}>IRS</option>
              </Field>
              <ErrorMessage
                name="interventionType"
                component="small"
                className="form-text text-danger"
              />
            </FormGroup>
            <FormGroup>
              <Label for="fiStatus">Focus Investigation Status</Label>
              <Field
                component="select"
                name="fiStatus"
                id="fiStatus"
                className={errors.fiStatus ? 'form-control is-invalid' : 'form-control'}
              >
                <option>----</option>
                {Object.entries(FIClassifications).map(e => (
                  <option key={e[1].code} value={e[1].code}>
                    {e[1].code} - {e[1].name}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="fiStatus" component="small" className="form-text text-danger" />
            </FormGroup>
            <FormGroup>
              <Label for="fiReason">Focus Investigation Reason</Label>
              <Field
                component="select"
                name="fiReason"
                id="fiReason"
                className={errors.fiReason ? 'form-control is-invalid' : 'form-control'}
              >
                <option>----</option>
                {FIReasons.map(e => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="fiReason" component="small" className="form-text text-danger" />
            </FormGroup>
            <FormGroup>
              <Label for="caseNum">Case Number</Label>
              <Field
                type="text"
                name="caseNum"
                id="caseNum"
                className={errors.caseNum ? 'form-control is-invalid' : 'form-control'}
              />
              <ErrorMessage name="caseNum" component="small" className="form-text text-danger" />

              <Field type="hidden" name="opensrpEventId" id="opensrpEventId" readOnly={true} />
            </FormGroup>
            <FormGroup>
              <Label for="title">Plan Title</Label>
              <Field
                type="text"
                name="title"
                id="title"
                className={errors.name || errors.title ? 'form-control is-invalid' : 'form-control'}
              />
              <ErrorMessage name="title" component="small" className="form-text text-danger" />

              <Field type="hidden" name="name" id="name" />
            </FormGroup>
            <FormGroup>
              <Label for="status">Status</Label>
              <Field
                component="select"
                name="status"
                id="status"
                className={errors.status ? 'form-control is-invalid' : 'form-control'}
              >
                {Object.entries(PlanStatus).map(e => (
                  <option key={e[0]} value={e[1]}>
                    {e[1]}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="status" component="small" className="form-text text-danger" />
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
