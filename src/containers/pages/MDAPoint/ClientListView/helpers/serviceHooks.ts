import { MouseEvent } from 'react'
import { toast } from 'react-toastify';
import { OPENSRP_FILE_UPLOAD_HISTORY_ENDPOINT } from '../../../../../constants';
import { growl } from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';
import store from '../../../../../store';
import { fetchFiles, File } from '../../../../../store/ducks/opensrp/files';
import { from } from 'seamless-immutable';

/** loads the organization data
 * @param {typeof OpenSRPService} service - the opensrp service
 * @param {typeof fetchFiles} fetchFilesCreator - action creator
 */
export const loadFiles = async (
  service: typeof OpenSRPService,
  fetchFilesCreator: typeof fetchFiles
) => {
  const serve = new service(OPENSRP_FILE_UPLOAD_HISTORY_ENDPOINT);
  serve
    .list()
    .then((response: File[]) => {
      debugger;
      store.dispatch(fetchFilesCreator(response, true));
    })
    .catch((err: Error) => {
      growl(err.message, { type: toast.TYPE.ERROR });
    });
};

export const handleDownload = (e:MouseEvent, id:string, name:string) => {
  e.preventDefault();
  const downloadService = new OpenSRPService(`upload/download`);
  downloadService.readFile(`${id}.csv`)
  .then(res => {
    const url = window.URL.createObjectURL(res);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  })
  .catch(err => {
    growl(err.message, { type: toast.TYPE.ERROR });
  })
}