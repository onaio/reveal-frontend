import { Dictionary } from '@onaio/utils';
import { toast } from 'react-toastify';
import { OPENSRP_API_BASE_URL } from '../../../../../configs/env';
import { FILE_UPLOADED_SUCCESSFULLY } from '../../../../../configs/lang';
import {
  OPENSRP_FILE_UPLOAD_HISTORY_ENDPOINT,
  OPENSRP_UPLOAD_ENDPOINT,
} from '../../../../../constants';
import { getAcessTokenOrRedirect, growl, successGrowl } from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';
import store from '../../../../../store';
import { fetchFiles, File } from '../../../../../store/ducks/opensrp/clientfiles';

/** useState function type for setting loader on and off */
type SetIsLoading = React.Dispatch<React.SetStateAction<boolean>> | null;

/** loads and persists to store files data from upload/history endpoint
 */
export const loadFiles = async (
  fetchFileAction = fetchFiles,
  serviceClass: typeof OpenSRPService = OpenSRPService,
  setLoading: SetIsLoading = null
) => {
  if (setLoading) {
    setLoading(true);
  }
  const serve = new serviceClass(OPENSRP_FILE_UPLOAD_HISTORY_ENDPOINT);
  await serve
    .list()
    .then((response: File[]) => {
      store.dispatch(fetchFileAction(response, true));
    })
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    })
    .finally(() => setLoading && setLoading(false));
};
/**
 * Posts uploaded file to opensrp
 * Todo:
 * Investigate why opensrp service fails to upload file
 * @param data uploaded formdata payload
 * @param setStateIfDone set state to trigger redirect on upload
 */
export const postUploadedFile = async (
  data: any,
  setStateIfDone: () => void,
  setFormSubmitstate: () => void,
  params?: string
) => {
  const accessToken = await getAcessTokenOrRedirect();
  const bearer = `Bearer ${accessToken}`;
  const response = await fetch(`${OPENSRP_API_BASE_URL}${OPENSRP_UPLOAD_ENDPOINT}/${params}`, {
    body: data,
    headers: {
      Authorization: bearer,
    },
    method: 'POST',
  });
  if (response.ok) {
    successGrowl(FILE_UPLOADED_SUCCESSFULLY);
    await loadFiles();
    setFormSubmitstate();
    setStateIfDone();
  } else {
    const err = `OpenSRPService update on ${OPENSRP_UPLOAD_ENDPOINT} failed, HTTP status ${response.status}`;
    growl(err, { type: toast.TYPE.ERROR });
    setFormSubmitstate();
  }
};
/**
 * Handles file downloads from server
 * @param {string} id csv identifier
 * @param {string} name file name
 */
export const handleDownload = async (
  id: string,
  name: string,
  endpoint: string,
  params?: Dictionary,
  serviceClass: any = OpenSRPService
) => {
  const downloadService = new serviceClass(endpoint);
  downloadService
    .readFile(id, params)
    .then((res: typeof Blob) => {
      const url = window.URL.createObjectURL(res);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.href = url;
      a.download = name;
      a.click();

      window.URL.revokeObjectURL(url);
    })
    .catch((err: any) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
};
