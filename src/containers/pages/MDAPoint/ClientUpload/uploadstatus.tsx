import { Dictionary } from '@onaio/utils';
import React, { useState } from 'react';
/**
 * UploadStatus Shows status of selected file on upload
 * Todo include more specific type for props
 */
export const UploadStatus = (props: Dictionary) => {
  const [loading, setLoading] = useState<boolean>(false);
  React.useEffect(() => {
    if (!props.file) {
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
    reader.readAsDataURL(props.file);
  }, [props.file]);

  const { file } = props;

  if (!file) {
    return null;
  }

  if (loading) {
    return <p>loading...</p>;
  }

  return <p>File is ready to submit</p>;
};
