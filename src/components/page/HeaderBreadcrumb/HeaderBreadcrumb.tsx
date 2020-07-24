import * as React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';
import { fetchUpdatedCurrentParentId } from '../../../store/ducks/opensrp/hierarchies';
import { connect } from 'react-redux';
import { Store } from 'redux';

/** interface describing page object for use in breadcrumbs */
export interface Page {
  url?: string;
  label: string;
}

export interface ActionCreator {
  fetchUpdatedCurrentParentIdAction: typeof fetchUpdatedCurrentParentId;
}

/** interface for breadcrumb items */
export interface BreadCrumbProps extends ActionCreator {
  currentPage: Page;
  pages: Page[];
  fetchUpdatedCurrentParentIdAction: typeof fetchUpdatedCurrentParentId;
}

export const defaultBreadCrumbProps: BreadCrumbProps = {
  currentPage: {
    url: '',
    label: '',
  },
  pages: [
    {
      url: '',
      label: '',
    },
  ],
  fetchUpdatedCurrentParentIdAction: fetchUpdatedCurrentParentId,
};

/** Configurable Breadcrumbs Component */
class HeaderBreadcrumbComponent extends React.Component<BreadCrumbProps, {}> {
  public static defaultProps = defaultBreadCrumbProps;
  constructor(props: BreadCrumbProps) {
    super(props);
  }

  public render() {
    const { currentPage, pages, fetchUpdatedCurrentParentIdAction } = this.props;

    const linkList = pages.map((page, key) => {
      // render breadcrumb items with urls as links or without urls as text nodes
      let breadCrumbItem: string | JSX.Element;
      if (page.url && page.url.trim()) {
        breadCrumbItem = (
          <Link to={page.url} key={key} onClick={() => fetchUpdatedCurrentParentIdAction('')}>
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

const mapStateToProps = (state: any, ownProps: any): any => {
  return {
    ...ownProps,
  };
};

const mapDispatchToProps = {
  fetchUpdatedCurrentParentIdAction: fetchUpdatedCurrentParentId,
};

const HeaderBreadcrumb = connect(mapStateToProps, mapDispatchToProps)(HeaderBreadcrumbComponent);

export default HeaderBreadcrumb;
