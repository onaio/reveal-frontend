import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { Label } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import * as Yup from 'yup';
import { OPENSRP_ORGANIZATION_ENDPOINT, REQUIRED } from '../../../constants';
import { OpenSRPService } from '../../../services/opensrp';

/** yup validation schema for teams Form input */
export const TeamSchema = Yup.object().shape({
  identifier: Yup.string(),
  name: Yup.string().required(REQUIRED),
});

/** interface for data fields for team's form */
interface TeamFormFields {
  identifier: string;
  name: string;
}

/** interface for Team form props */
export interface TeamFormProps {
  /** list of fields to disable */
  disabledFields: string[];
  initialValues: TeamFormFields;
  /** redirect to this url after form submission */
  redirectAfterAction: string;
}

const defaultInitialValues: TeamFormFields = {
  identifier: '',
  name: '',
};

/** makes call to opensrpService to either create or edit a data object
 * from inside formik.
 */
// export const AddOrModify(editMode: boolean, payload: any, setSubmitting: any, setIfDoneWorkingOnForm: any, setGlobalError: any): void{
//     const defaultFunction = (...args: any) => {};
//     // might or might not need to call hooks
//     const apiService = new OpenSRPService(OPENSRP_ORGANIZATION_ENDPOINT);
//     if(editMode){
//         apiService.update(payload).then(() => {
//             setSubmitting(false);
//             setIfDoneWorkingOnForm(true);
//         }).catch((e: Error) => {
//             setGlobalError(e.message)
//         });
//     }else{
//         apiService.create(payload).then(() => {
//             setSubmitting(false);
//             setIfDoneWorkingOnForm(true);
//         }).catch((e: Error) => {
//             setGlobalError(e.message)
//         });
//     }
// }

/** Team form component */
const TeamForm = (props: TeamFormProps) => {
  /** track when redirection from this form page should occur */
  const [ifDoneHere, setifDoneHere] = useState<boolean>(false);
  const { initialValues, redirectAfterAction, disabledFields } = props;
  const [globalError, setGlobalError] = useState<string>('');
  /** editmode set to true if we are updating a team data. */
  const editMode: boolean = initialValues.identifier !== '';

  return (
    <div className="form-container">
      {ifDoneHere && <Redirect to={redirectAfterAction} />}
      <Formik
        initialValues={initialValues}
        validationSchema={TeamSchema}
        // tslint:disable-next-line: jsx-no-lambda
        onSubmit={(values, { setSubmitting }) => {
          const apiService = new OpenSRPService(OPENSRP_ORGANIZATION_ENDPOINT);

          if (editMode) {
            apiService
              .update(values)
              .then(() => {
                setSubmitting(false);
                setifDoneHere(true);
              })
              .catch((e: Error) => {
                setGlobalError(e.message);
              });
          } else {
            apiService
              .create(values)
              .then(() => {
                setSubmitting(false);
                setifDoneHere(true);
              })
              .catch((e: Error) => {
                setGlobalError(e.message);
              });
          }
        }}
      >
        {({ errors, handleChange, isSubmitting, setFieldValue, values }) => (
          <Form>
            <FormGroup className="non-field-errors">
              {globalError !== '' && <p className="">{globalError}</p>}
              <ErrorMessage name="name" component="p" className="form-text text-danger" />
              <ErrorMessage name="date" component="p" className="form-text text-danger" />
            </FormGroup>
            <FormGroup>
              <Label>
                Team Id
                <Field
                  type="text"
                  name="identifier"
                  id="identifier"
                  disabled={disabledFields.includes('identifier')}
                  className={errors.identifier ? `form-control is-invalid` : `form-control`}
                />
                <ErrorMessage name="identifier" className="form-text text-danger" />
              </Label>
            </FormGroup>
            <FormGroup>
              <Label>
                Name
                <Field
                  type="text"
                  name="name"
                  id="name"
                  disabled={disabledFields.includes('name')}
                  className={errors.name ? `form-control is-invalid` : `form-control`}
                />
                <ErrorMessage name="name" className="form-text text-danger" />
              </Label>
            </FormGroup>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const defaultProps: TeamFormProps = {
  disabledFields: [],
  initialValues: defaultInitialValues,
  redirectAfterAction: '/teams',
};

/** default Props for updating team data objects */
const propsForUpdatingTeam: Partial<TeamFormProps> = {
  disabledFields: ['identifier'],
};

TeamForm.defaultProps = defaultProps;
export default TeamForm;
