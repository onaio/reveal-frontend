import download from 'downloadjs';
import { toast } from 'react-toastify';
import { FILE_UPLOAD_FAILED, FILE_UPLOADED_SUCCESSFULLY } from '../../../../../configs/lang';
import { OPENSRP_FILE_UPLOAD_HISTORY_ENDPOINT } from '../../../../../constants';
import { growl } from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';
import store from '../../../../../store';
import { fetchFiles, File } from '../../../../../store/ducks/opensrp/files';
import { getAccessToken } from '../../../../../store/selectors';

/** loads files data
 */
export const loadFiles = async () => {
  const serve = new OpenSRPService(OPENSRP_FILE_UPLOAD_HISTORY_ENDPOINT);
  serve
    .list()
    .then((response: File[]) => {
      store.dispatch(fetchFiles(response, true));
    })
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
};
/**
 * Fetches csv data from server and downloads the same
 * Todo:
 * Use Opensrpservice to make this call
 * @param {string} url - identifier eg 342515535161162.csv
 * @param {string} fileName - csv file name
 */
export const fetchCsvData = (url: string, fileName: string) => async () => {
  const response = await fetch(
    `https://reveal-stage.smartregister.org/opensrp/rest/upload/download/${url}`,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken(store.getState())}`,
      },
      method: 'GET',
    }
  )
    .then(resp => {
      if (!resp.ok) {
        throw new Error(`Submission Export Failed, HTTP status ${resp.status}`);
      }
      return resp.blob();
    })
    .then(blob => {
      download(blob, fileName, 'text/csv');
    });
  return response;
};

export const postUploadedFile = async (data: any, setStateIfDone: () => void) => {
  const bearer = `Bearer ${getAccessToken(store.getState())}`;
  await fetch(
    'https://reveal-stage.smartregister.org/opensrp/rest/upload/?event_name=Child%20Registration',
    {
      body: data,
      headers: {
        Authorization: bearer,
      },
      method: 'POST',
    }
  )
    .then(response => response.json())
    .then(async () => {
      growl(FILE_UPLOADED_SUCCESSFULLY, {
        onClose: () => setStateIfDone(),
        type: toast.TYPE.SUCCESS,
      });
      await loadFiles();
    })
    .catch(() => {
      growl(FILE_UPLOAD_FAILED, {
        onClose: () => setStateIfDone(),
        type: toast.TYPE.ERROR,
      });
    });
};
