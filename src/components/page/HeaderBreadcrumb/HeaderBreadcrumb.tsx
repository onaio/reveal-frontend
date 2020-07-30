import * as React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

/** interface describing page object for use in breadcrumbs */
export interface Page {
  url?: string;
  label: string;
}

/** interface for breadcrumb items */
export interface BreadCrumbProps {
  currentPage: Page;
  pages: Page[];
  fetchUpdatedCurrentParentHandler: (currentParentId: string, isRootJurisdiction: boolean) => void;
}

export const defaultBreadCrumbProps: Partial<BreadCrumbProps> = {
  currentPage: {
    label: '',
    url: '',
  },
  pages: [
    {
      label: '',
      url: '',
    },
  ],
};

/** Configurable Breadcrumbs Component */
class HeaderBreadcrumb extends React.Component<BreadCrumbProps, {}> {
  public static defaultProps = defaultBreadCrumbProps;
  constructor(props: BreadCrumbProps) {
    super(props);
  }

  public render() {
    const { currentPage, pages, fetchUpdatedCurrentParentHandler } = this.props;

    const linkList = pages.map((page, key) => {
      // render breadcrumb items with urls as links or without urls as text nodes
      let breadCrumbItem: string | JSX.Element;
      if (page.url && page.url.trim()) {
        breadCrumbItem = (
          <Link
            to={page.url}
            key={key}
            // tslint:disable-next-line: jsx-no-lambda
            onClick={() => {
              // add this check because not all components are passing this handler function
              // as a prop to this component
              if (!!fetchUpdatedCurrentParentHandler) {
                fetchUpdatedCurrentParentHandler('', false);
              }
            }}
          >
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
