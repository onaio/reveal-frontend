import React, { useState } from 'react';
/**
 * UploadStatus Shows status of selected file on upload
 * Will come in very handy when uploading huge csv files
 * Todo include more specific type for props
 */
const UploadStatus = (props: any) => {
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
    return <p>loading...</p>;
  }

  return <p>File is ready to submit</p>;
};
export default UploadStatus;
