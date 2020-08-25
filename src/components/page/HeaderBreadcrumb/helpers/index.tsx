import * as React from 'react';
import { Link } from 'react-router-dom';
import { BreadcrumbItem } from 'reactstrap';
import { BreadCrumbProps, Page } from '../HeaderBreadcrumb';

const LinkList = (props: Partial<BreadCrumbProps>) => {
  const { pages } = props;

  const linkList = (pages as Page[]).map((page, key) => {
    // render breadcrumb items with urls as links or without urls as text nodes
    let breadCrumbItem: string | JSX.Element;
    if (page.url && page.url.trim()) {
      breadCrumbItem = (
        <Link to={page.url} key={key}>
          {page.label}
        </Link>
      );
    } else {
      breadCrumbItem = page.label;
    }
    return <BreadcrumbItem key={key}>{breadCrumbItem}</BreadcrumbItem>;
  });

  return <>{linkList}</>;
};

export { LinkList };
