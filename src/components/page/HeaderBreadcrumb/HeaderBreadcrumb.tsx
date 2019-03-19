// This component represents the breadcrumbs in the header part of the web app
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

interface Page {
  url: string;
  label: string;
}

export interface BreadCrumbItems {
  currentPage: Page;
  pages: Page[];
}

class HeaderBreadcrumb extends React.Component<BreadCrumbItems, {}> {
  constructor(props: BreadCrumbItems) {
    super(props);
  }

  public render() {
    const { currentPage, pages } = this.props;

    const linkList = pages.map((page, key) => {
      return (
        <BreadcrumbItem key={key}>
          <Link to={page.url} key={key}>
            {page.label}
          </Link>
        </BreadcrumbItem>
      );
    });

    return (
      <div>
        <Breadcrumb className="reveal-breadcrumb">
          {linkList}
          <BreadcrumbItem active={true}>{currentPage.label}</BreadcrumbItem>
        </Breadcrumb>
      </div>
    );
  }
}

export default HeaderBreadcrumb;
