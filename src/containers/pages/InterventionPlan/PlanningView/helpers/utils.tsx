import { DrillDownColumn } from '@onaio/drill-down-table/dist/types';
import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { Cell } from 'react-table';
import Col from 'reactstrap/lib/Col';
import Row from 'reactstrap/lib/Row';
import { format } from 'util';
import LinkAsButton from '../../../../../components/LinkAsButton';
import HeaderBreadcrumbs, {
  BreadCrumbProps,
} from '../../../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import {
  CREATE_NEW_PLAN,
  DATE_CREATED,
  NAME,
  PLANS_USER_FILTER_NOTIFICATION,
  STATUS_HEADER,
} from '../../../../../configs/lang';
import { planStatusDisplay } from '../../../../../configs/settings';
import { ASSIGN_JURISDICTIONS_URL } from '../../../../../constants';
import { PlanRecord } from '../../../../../store/ducks/plans';
import { RenderProp } from './OpenSRPPlansList';

/** Columns definition for IRS drafts page table */
export const commonColumns: Array<DrillDownColumn<PlanRecord>> = [
  {
    Header: DATE_CREATED,
    accessor: 'plan_date',
    maxWidth: 50,
    minWidth: 20,
  },
  {
    Header: STATUS_HEADER,
    accessor: (d: PlanRecord) => planStatusDisplay[d.plan_status] || d.plan_status,
    id: 'plan_status',
    maxWidth: 50,
    minWidth: 20,
  },
];

/** columns for the draft plan page */
export const draftPageColumns: Array<DrillDownColumn<PlanRecord>> = [
  {
    Cell: (cell: Cell<PlanRecord>) => {
      const original = cell.row.original;
      return (
        <Link to={`${ASSIGN_JURISDICTIONS_URL}/${original.id}`} key={original.id}>
          {cell.value}
        </Link>
      );
    },
    Header: NAME,
    accessor: 'plan_title',
    minWidth: 200,
  },
  ...commonColumns,
];

/** options for when creating the drafts page plans render prop */
interface Options {
  addPlanBtnText?: string;
  pageTitle: string;
  breadCrumbProps: BreadCrumbProps;
  newPlanUrl: string;
  userParam?: string;
}
/** creates a render prop that receives a render function for the plans list table and
 * renders the whole view.
 */
export const draftPlansPageBodyFactory = (options: Options) => {
  const { pageTitle, breadCrumbProps, newPlanUrl, addPlanBtnText, userParam } = options;
  return (renderConnectedTable: RenderProp) => {
    return (
      <div className="mb-5">
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <HeaderBreadcrumbs {...breadCrumbProps} />
        <Row>
          <Col md={8}>
            <h3 className="mt-3 mb-3 page-title">{pageTitle}</h3>
            {userParam && <p>{format(PLANS_USER_FILTER_NOTIFICATION, userParam)}</p>}
          </Col>
          {newPlanUrl && (
            <Col md={4}>
              <LinkAsButton
                to={newPlanUrl}
                classNameProp="create-plan btn btn-primary float-right mt-3 mb-3"
                text={addPlanBtnText || CREATE_NEW_PLAN}
              />
            </Col>
          )}
        </Row>
        {renderConnectedTable()}
        <br />
      </div>
    );
  };
};
