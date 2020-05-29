import { Dictionary } from '@onaio/utils';
import { ErrorMessage, Field, Formik } from 'formik';
import React, { useState } from 'react';
import { Redirect } from 'react-router';
import { Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import * as Yup from 'yup';
import LocationSelect from '../../../../components/forms/LocationSelect';
import SimpleOrgSelect from '../../../../components/forms/SimpleOrgSelect';
import LinkAsButton from '../../../../components/LinkAsButton';
import { CLIENT_UPLOAD_FORM, REQUIRED } from '../../../../configs/lang';
import { STUDENTS_LIST_URL } from '../../../../constants';
import { postUploadedFile } from '../ClientListView/helpers/serviceHooks';
import UploadStatus from '../ClientUploadStatus/';

export const uploadValidationSchema = Yup.object().shape({
  file: Yup.mixed().required(),
  jurisdictions: Yup.object().shape({
    id: Yup.string().required(REQUIRED),
    name: Yup.string(),
  }),
});
/** interface to describe props for ExportForm component */
export interface UploadFormField {
  file: string | null;
  jurisdictions: Dictionary;
  team: Dictionary;
}
export const ClientUpload = () => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [ifDoneHere, setIfDoneHere] = useState<boolean>(false);
  const defaultInitialValues: UploadFormField = {
    file: null,
    jurisdictions: {
      id: '',
      name: '',
    },
    team: {
      label: '',
      value: '',
    },
  };
  const closeUploadModal = {
    classNameProp: 'focus-investigation btn btn-primary float-right mt-0',
    text: 'Go Back',
    to: '/clients/students',
  };
  if (ifDoneHere) {
    return <Redirect to={STUDENTS_LIST_URL} />;
  }
  const setStateIfDone = () => {
    setIfDoneHere(true);
  };
  return (
    <div>
      <Modal isOpen={true}>
        <ModalHeader>{CLIENT_UPLOAD_FORM}</ModalHeader>
        <ModalBody>
          <Formik
            initialValues={defaultInitialValues}
            validationSchema={uploadValidationSchema}
            // tslint:disable-next-line: jsx-no-lambda
            onSubmit={async (values, { setSubmitting }) => {
              const setSubmittingStatus = () => setSubmitting(false);
              const data = new FormData();
              data.append('file', selectedFile);
              const uploadParams = `&location_id=${values.jurisdictions.id}&team_id=${values.team}`;
              await postUploadedFile(data, setStateIfDone, setSubmittingStatus, uploadParams);
            }}
          >
            {({ values, setFieldValue, handleSubmit, errors, isSubmitting }) => (
              <Form onSubmit={handleSubmit} data-enctype="multipart/form-data">
                <FormGroup className={'async-select-container'}>
                  <Label for={`jurisdictions-${1}-id`}>{'Geographical level to include'}</Label>
                  &nbsp;
                  <div style={{ display: 'inline-block', width: '24rem' }}>
                    <Field
                      required={true}
                      component={LocationSelect}
                      cascadingSelect={true}
                      name={`jurisdictions.id`}
                      id={`jurisdictions-id`}
                      className={'async-select'}
                      labelFieldName={`jurisdictions.name`}
                    />
                  </div>
                  <Field type="hidden" name={`jurisdictions.name`} id={`jurisdictions-name`} />
                  {errors.jurisdictions && (
                    <small className="form-text text-danger jurisdictions-error">
                      {'Please select location'}
                    </small>
                  )}
                  {
                    <ErrorMessage
                      name={`jurisdictions.id`}
                      component="small"
                      className="form-text text-danger"
                    />
                  }
                </FormGroup>
                {values && values.jurisdictions && values.jurisdictions.id && (
                  <FormGroup>
                    <Label for="team">Assign team for this school</Label>
                    <div style={{ display: 'inline-block', width: '24rem' }}>
                      <Field
                        required={true}
                        component={SimpleOrgSelect}
                        cascadingSelect={true}
                        name={`team`}
                        id={`team-id`}
                        className={'async-select'}
                      />
                    </div>
                  </FormGroup>
                )}
                <FormGroup>
                  <Label for="upload-file">Upload File</Label>
                  <Input
                    type="file"
                    name="file"
                    id="exampleFile"
                    accept=".csv"
                    // tslint:disable-next-line: jsx-no-lambda
                    onChange={(event: any) => {
                      setSelectedFile(event.target.files[0]);
                      setFieldValue(
                        'file',
                        event && event.target && event.target.files && event.target.files[0]
                      );
                    }}
                  />
                </FormGroup>
                <UploadStatus uploadFile={values.file} />

                {errors && errors.file ? (
                  <small className="form-text text-danger jurisdictions-error">{errors.file}</small>
                ) : null}
                <hr />
                <div style={{ display: 'inline-block', width: '12rem' }}>
                  <Button
                    type="submit"
                    id="studentexportform-submit-button"
                    className="btn btn-md btn btn-primary"
                    color="primary"
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                  <LinkAsButton {...closeUploadModal} />
                </div>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </Modal>
    </div>
  );
};
export default ClientUpload;
