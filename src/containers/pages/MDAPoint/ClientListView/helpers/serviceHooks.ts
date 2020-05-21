import { toast } from 'react-toastify';
import { OPENSRP_FILE_UPLOAD_HISTORY_ENDPOINT } from '../../../../../constants';
import { growl } from '../../../../../helpers/utils';
import { OpenSRPService } from '../../../../../services/opensrp';
import store from '../../../../../store';
import { fetchFiles, File } from '../../../../../store/ducks/opensrp/files';

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
