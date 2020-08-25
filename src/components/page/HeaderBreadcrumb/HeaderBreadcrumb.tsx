import * as React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { LinkList } from './helpers';

/** interface describing page object for use in breadcrumbs */
export interface Page {
  url?: string;
  label: string;
}

/** interface for breadcrumb items */
export interface BreadCrumbProps {
  currentPage: Page;
  pages: Page[];
}

/** Configurable Breadcrumbs Component */
class HeaderBreadcrumb extends React.Component<BreadCrumbProps, {}> {
  constructor(props: BreadCrumbProps) {
    super(props);
  }

  public render() {
    const { currentPage } = this.props;

    return (
      <div>
        <Breadcrumb className="reveal-breadcrumb">
          <LinkList {...this.props} />
          <BreadcrumbItem active={true}>{currentPage.label}</BreadcrumbItem>
        </Breadcrumb>
      </div>
    );
  }
}

export default HeaderBreadcrumb;
