// This component represents the breadcrumbs in the header part of the web app
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

interface Page {
  url?: string;
  label: string;
}

export interface BreadCrumbItems {
  currentPage: Page;
  pages: Page[];
}

/** Create Breadcrumps Component */
class HeaderBreadcrumb extends React.Component<BreadCrumbItems, {}> {
  constructor(props: BreadCrumbItems) {
    super(props);
  }

  public render() {
    const { currentPage, pages } = this.props;

    const linkList = pages.map((page, key) => {
      // render breadcrumb items with urls as links or without urls as text nodes
      let breadCrumbItem: string | JSX.Element;
      if (page.url && page.url.trim()) {
        breadCrumbItem = (
          <Link to={page.url!} key={key}>
            {page.label}
          </Link>
        );
      } else {
        breadCrumbItem = page.label;
      }
      return <BreadcrumbItem key={key}>{breadCrumbItem}</BreadcrumbItem>;
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
