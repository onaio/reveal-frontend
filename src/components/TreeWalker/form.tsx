import { ErrorMessage, Field, Form, Formik, FormikActions } from 'formik';
import moment from 'moment';
import React, { Fragment } from 'react';
import { Button, Col, FormGroup, Row } from 'reactstrap';
import { SAVE, SAVING, TEAM_ASSIGNEMENT_SUCCESSFUL } from '../../configs/lang';
import { PlanDefinition } from '../../configs/settings';
import { OPENSRP_POST_ASSIGNMENTS_ENDPOINT } from '../../constants';
import { successGrowl } from '../../helpers/utils';
import { OpenSRPService } from '../../services/opensrp';
import { Assignment } from '../../store/ducks/opensrp/assignments';
import { SelectField, SelectOption } from './SelectField';
import { OpenSRPJurisdiction } from './types';

export interface AssignmentFormProps {
  callBackFunc: () => void;
  defaultValue: SelectOption[];
  jurisdiction: OpenSRPJurisdiction | null;
  options: SelectOption[];
  plan: PlanDefinition | null;
}

export const defaultAssignmentProps: AssignmentFormProps = {
  callBackFunc: () => null,
  defaultValue: [],
  jurisdiction: null,
  options: [],
  plan: null,
};

interface FormValues {
  organizations: string[];
}

const getPayload = (
  selectedOrgs: string[],
  selectedPlan: PlanDefinition,
  selectedJurisdiction: OpenSRPJurisdiction
): Assignment[] => {
  if (selectedOrgs.length > 0) {
    return selectedOrgs.map(orgId => {
      const now = moment(new Date());
      const planStart = moment(selectedPlan.effectivePeriod.start);
      return {
        fromDate: planStart > now ? now.format() : planStart.format(),
        jurisdiction: selectedJurisdiction.id,
        organization: orgId,
        plan: selectedPlan.identifier,
        toDate: moment(selectedPlan.effectivePeriod.end).format(),
      };
    });
  }
  // TODO: remove assignments for this plan and jurisdiction
  return [];
};

const JurisdictionAssignmentForm = (props: AssignmentFormProps) => {
  const { callBackFunc, defaultValue, jurisdiction, options, plan } = props;

  if (!jurisdiction || !plan) {
    return <span>something bad happened</span>;
  }

  const initialValues: FormValues = {
    organizations: defaultValue.map(e => e.value),
  };

  const submitForm = (
    values: FormValues,
    { setSubmitting, setFieldError }: FormikActions<FormValues>
  ) => {
    setSubmitting(true);
    const payload = getPayload(values.organizations, plan, jurisdiction);
    const OpenSrpAssignmentService = new OpenSRPService(OPENSRP_POST_ASSIGNMENTS_ENDPOINT);
    OpenSrpAssignmentService.create(payload)
      .then(response => {
        if (response) {
          successGrowl(TEAM_ASSIGNEMENT_SUCCESSFUL);
        } else {
          setFieldError('organizations', "Didn't save successfully");
        }
      })
      .finally(() => setSubmitting(false))
      .catch((error: Error) => setFieldError('organizations', error.message));
  };

  return (
    <Fragment>
      <Formik initialValues={initialValues} onSubmit={submitForm}>
        {({ errors, isSubmitting }) => (
          <Form className="mb-5">
            <FormGroup className="select-orgs">
              <Field
                className={errors.organizations ? 'form-control is-invalid' : 'form-control'}
                component={SelectField}
                defaultValue={defaultValue}
                name="organizations"
                options={options}
              />
              <ErrorMessage
                name="organizations"
                component="p"
                className="form-text text-danger name-error"
              />
            </FormGroup>
            <FormGroup className="submit-group">
              <Row>
                <Col md="6">
                  <Button className="btn-block" size="sm" type="button" onClick={callBackFunc}>
                    Close
                  </Button>
                </Col>
                <Col md="6">
                  <Button
                    className="btn-block"
                    color="primary"
                    size="sm"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? SAVING : SAVE}
                  </Button>
                </Col>
              </Row>
            </FormGroup>
          </Form>
        )}
      </Formik>
    </Fragment>
  );
};

JurisdictionAssignmentForm.defaultProps = defaultAssignmentProps;

export { JurisdictionAssignmentForm };
