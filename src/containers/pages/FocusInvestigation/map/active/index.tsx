import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { RouteParams } from '../../../../../helpers/utils';

/** Map View for Single Active Focus Investigation */
class SingleActiveFIMap extends React.Component<RouteComponentProps<RouteParams>, {}> {
  constructor(props: RouteComponentProps<RouteParams>) {
    super(props);
  }

  public render() {
    return (
      <div>
        <h2 className="page-title mt-4 mb-5">Map View</h2>
      </div>
    );
  }
}

export default SingleActiveFIMap;
