import React, { useState } from 'react';
import { FILE_SUBMISSION_READY, LOADING } from '../../../../configs/lang';
/**
 * UploadStatus Shows status of selected file on upload
 * Will come in very handy when uploading huge csv files
 * Todo include more specific type for props
 */
export interface UploadStatusProps {
  uploadFile: Blob;
}
const UploadStatus = (props: UploadStatusProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  React.useEffect(() => {
    if (!props.uploadFile) {
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    /**
     * once selectedfile load setloading to false
     */
    reader.onloadend = () => {
      setLoading(false);
    };
    reader.readAsDataURL(props.uploadFile);
  }, [props.uploadFile]);

  const { uploadFile } = props;
  if (!uploadFile) {
    return null;
  }

  if (loading) {
    return <p>{LOADING}</p>;
  }

  return <p>{FILE_SUBMISSION_READY}</p>;
};
export default UploadStatus;
