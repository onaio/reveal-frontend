import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from 'reactstrap';
import * as Yup from 'yup';
import LinkAsButton from '../../../../components/LinkAsButton';
import { OpenSRPService } from '../../../../services/opensrp';
import store from '../../../../store';
import { getAccessToken } from '../../../../store/selectors';
import { UploadStatus } from './uploadstatus';
export const uploadValidationSchema = Yup.object().shape({
  file: Yup.mixed().required(),
});
/** interface to describe props for ExportForm component */
export interface UploadFormField {
  file: string | null;
  location: any;
}
export const ClientUpload = (props: any) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const defaultInitialValues: UploadFormField = {
    file: null,
    location: props.location,
  };
  const closeUploadModal = {
    classNameProp: 'focus-investigation btn btn-primary float-right mt-0',
    text: 'Go Back',
    to: '/clients/students',
  };
  return (
    <div>
      <Modal isOpen={true}>
        <ModalHeader>Modal title</ModalHeader>
        <ModalBody>
          <Formik
            initialValues={defaultInitialValues}
            validationSchema={uploadValidationSchema}
            // tslint:disable-next-line: jsx-no-lambda
            onSubmit={(values, { setSubmitting }) => {
              setSubmitting(true);
              const { file } = values;
              const data = new FormData();
              data.append('file', selectedFile);
              // tslint:disable-next-line: no-floating-promises
              // axios
              //   .post(
              //     'https://reveal-stage.smartregister.org/opensrp/rest/upload/validate?event_name=Child%20Registration',
              //     data,
              //     {
              //       // receive two parameter endpoint url ,form data
              //     }
              //   )
              //   .then(res => {
              //     // then print response status
              //     console.log(res.statusText);
              //   });
              // const apiService = new OpenSRPService('upload/validate');
              // apiService
              //   .create(data, { event_name: 'Child Registration' })
              //   .then(response => {
              //     console.log(response);
              //     // setSubmitting(false);
              //     // setAreWeDoneHere(true);
              //   })
              //   .catch((e: Error) => {
              //     console.log(e);
              //     // setGlobalError(e.message);
              //   });
              const bearer = `Bearer ${getAccessToken(store.getState())}`;
              fetch(
                'https://reveal-stage.smartregister.org/opensrp/rest/upload/?event_name=Child%20Registration',
                {
                  method: 'POST',
                  body: data,
                  headers: {
                    Authorization: bearer,
                  },
                }
              )
                .then(response => response.json())
                .then(data => {
                  console.log(data);
                })
                .catch(error => {
                  console.error(error);
                });
            }}
          >
            {({ values, setFieldValue, handleSubmit, isSubmitting, errors }) => (
              <form onSubmit={handleSubmit} data-enctype="multipart/form-data">
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
                      //   console.log(typeof event.target.files[0]);
                      setFieldValue(
                        'file',
                        event && event.target && event.target.files && event.target.files[0]
                      );
                    }}
                  />
                </FormGroup>
                <UploadStatus uploadFile={values.file} />
                {errors.file ? <p> {JSON.stringify(errors.file)} </p> : null}
                <hr />
                <div style={{ display: 'inline-block', width: '12rem' }}>
                  <Button
                    type="submit"
                    id="studentexportform-submit-button"
                    className="btn btn-md btn btn-primary"
                    color="primary"
                  >
                    Submit
                  </Button>
                  <LinkAsButton {...closeUploadModal} />
                </div>
              </form>
            )}
          </Formik>
        </ModalBody>
      </Modal>
    </div>
  );
};
export default ClientUpload;
