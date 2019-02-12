// This component represents the breadcrumbs in the header part of the web app
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

class HeaderBreadcrumb extends React.Component<{}, {}> {
  constructor(props: {}) {
    super(props);
  }

  public render() {
    return (
      <div>
        <Breadcrumb className="reveal-breadcrumb">
          <BreadcrumbItem>
            <Link to="/irs">IRS</Link>
          </BreadcrumbItem>
          <BreadcrumbItem active={true}>The Current Page</BreadcrumbItem>
        </Breadcrumb>
      </div>
    );
  }
}

export default HeaderBreadcrumb;
