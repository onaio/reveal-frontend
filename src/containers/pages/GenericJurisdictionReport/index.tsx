import DrillDownTable, { hasChildrenFunc } from '@onaio/drill-down-table';
import reducerRegistry from '@onaio/redux-reducer-registry';
import superset, { SupersetFormData } from '@onaio/superset-connector';
import { Dictionary } from '@onaio/utils';
import { get } from 'lodash';
import React, { SyntheticEvent, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { RouteComponentProps } from 'react-router';
import { Column, RowInfo } from 'react-table';
import 'react-table/react-table.css';
import { Col, Row } from 'reactstrap';
import { Store } from 'redux';
import HeaderBreadcrumb from '../../../components/page/HeaderBreadcrumb/HeaderBreadcrumb';
import Loading from '../../../components/page/Loading';
import { SUPERSET_MAX_RECORDS } from '../../../configs/env';
import { HOME } from '../../../configs/lang';
import { HOME_URL } from '../../../constants';
import { displayError } from '../../../helpers/errors';
import '../../../helpers/tables.css';
import { RouteParams } from '../../../helpers/utils';
import supersetFetch from '../../../services/superset';
import GenericJurisdictionsReducer, {
  fetchGenericJurisdictions,
  GenericJurisdiction,
  reducerName as GenericJurisdictionsReducerName,
} from '../../../store/ducks/generic/jurisdictions';
import { fetchMDAPointPlans } from '../../../store/ducks/generic/MDAPointPlans';
import { fetchIRSPlans, GenericPlan } from '../../../store/ducks/generic/plans';
import { getJurisdictionBreadcrumbs } from '../IRS/Map/helpers';
import { plansTableColumns } from './helpers';
import './style.css';

/** register the reducers */
reducerRegistry.register(GenericJurisdictionsReducerName, GenericJurisdictionsReducer);

/** IRS Jurisdictions props */
export interface GenericJurisdictionProps {
  /** The url for navigating to this page */
  baseURL: string;
  cellComponent: React.ElementType<any>;
  /** Title of this page */
  pageTitle: string;
  /** Action for dispatching jurisdictions to store */
  fetchJurisdictions: typeof fetchGenericJurisdictions;
  /** An action for dispatching  plans */
  fetchPlans: typeof fetchMDAPointPlans | typeof fetchIRSPlans;
  /** Reporting focus area column */
  focusAreaColumn: string;
  /** Jurisdiction depth of the lowest level jurisdictions */
  focusAreaLevel: string;
  /** Indicates whether jurisdiction has children or not */
  hasChildren: typeof hasChildrenFunc;
  LegendIndicatorComp: React.ElementType<any> | null;
  /** The reporting jurisdiction columns */
  jurisdictionColumn: string;
  jurisdictions: GenericJurisdiction[] | null;
  plan: GenericPlan | null;
  /** The superset reporting plan slice */
  reportingPlanSlice: string;
  /** Get superset plans for the provided superset slice  */
  service: typeof supersetFetch;
  /** Array of superset slices containing the reporting jurisdiction data */
  slices: string[];
}

/** Renders generic Jurisdictions reports */
const GenericJurisdictionReport = (
  props: GenericJurisdictionProps & RouteComponentProps<RouteParams>
) => {
  const [jurisdictionId, setJurisdictionId] = useState<string | null>(
    (props.match && props.match.params && props.match.params.jurisdictionId) || null
  );
  const [loading, setLoading] = useState<boolean>(true);

  let planId: string | null = null;
  if (props.match && props.match.params && props.match.params.planId) {
    planId = props.match.params.planId;
  }
  const {
    fetchJurisdictions,
    hasChildren,
    jurisdictions,
    plan,
    service,
    slices,
    baseURL,
    pageTitle,
    jurisdictionColumn,
    focusAreaColumn,
    focusAreaLevel,
    fetchPlans,
    reportingPlanSlice,
    LegendIndicatorComp,
    cellComponent,
  } = props;

  /** async function to load the data */
  async function loadData() {
    try {
      setLoading(!plan || !jurisdictions || jurisdictions.length < 1); // set loading when there is no data
      let fetchPlansParams: SupersetFormData | null = null;
      if (planId) {
        fetchPlansParams = superset.getFormData(1, [
          { comparator: planId, operator: '==', subject: 'plan_id' },
        ]);
      }

      await service(reportingPlanSlice, fetchPlansParams).then((result: GenericPlan[]) => {
        fetchPlans(result);
      });

      slices.forEach(async slice => {
        let fetchJurisdictionsParams: SupersetFormData | null = null;
        if (planId) {
          fetchJurisdictionsParams = superset.getFormData(
            SUPERSET_MAX_RECORDS,
            [{ comparator: planId, operator: '==', subject: 'plan_id' }],
            { jurisdiction_depth: true, jurisdiction_name: true }
          );
        }
        await service(slice, fetchJurisdictionsParams).then((result: GenericJurisdiction[]) => {
          fetchJurisdictions(slice, result);
        });
      });
    } catch (e) {
      // todo - handle error https://github.com/onaio/reveal-frontend/issues/300
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(err => displayError(err));
  }, []);

  useEffect(() => {
    if (props.match && props.match.params && props.match.params.jurisdictionId) {
      setJurisdictionId(props.match.params.jurisdictionId);
    } else {
      setJurisdictionId(null);
    }
  }, [props.match.params.jurisdictionId]);

  if (loading === true) {
    return <Loading />;
  }

  const data = jurisdictions || [];

  const parentNodes = data.map((el: Dictionary) => el.jurisdiction_parent_id);

  let currentPageTitle = pageTitle;
  let currentBaseURL = baseURL;
  const basePage = {
    label: currentPageTitle,
    url: baseURL,
  };
  const breadcrumbProps = {
    currentPage: basePage,
    pages: [
      {
        label: HOME,
        url: HOME_URL,
      },
    ],
  };

  let planPage = basePage;
  if (plan) {
    currentPageTitle = `${pageTitle}: ${plan.plan_title}`;
    currentBaseURL = `${baseURL}/${plan.plan_id}`;
    planPage = {
      label: plan.plan_title,
      url: currentBaseURL,
    };
    breadcrumbProps.currentPage = planPage;
    breadcrumbProps.pages.push(basePage);
  }

  const theObject = data.filter((el: Dictionary) => el.jurisdiction_id === jurisdictionId);

  let currentJurisdictionName: string | null = null;
  if (theObject && theObject.length > 0) {
    const pages = getJurisdictionBreadcrumbs(theObject[0], currentBaseURL);

    breadcrumbProps.pages.push(planPage);

    const newPages = breadcrumbProps.pages.concat(pages);
    breadcrumbProps.pages = newPages;

    const currentPage = {
      label: theObject[0].jurisdiction_name,
      url: `${currentBaseURL}/${theObject[0].jurisdiction_id}`,
    };
    breadcrumbProps.currentPage = currentPage;

    currentJurisdictionName = theObject[0].jurisdiction_name;
  }

  const currLevelData = data.filter(el => el.jurisdiction_parent_id === jurisdictionId);

  let columnsToUse = get(plansTableColumns, jurisdictionColumn, null);
  if (currLevelData && currLevelData.length > 0) {
    if (currLevelData[0].jurisdiction_depth === +focusAreaLevel) {
      columnsToUse = get(plansTableColumns, focusAreaColumn, null);
    }
  }

  const tableProps = {
    ...(columnsToUse && { columns: columnsToUse }),
    CellComponent: cellComponent,
    data,
    defaultPageSize: data.length,
    extraCellProps: { urlPath: currentBaseURL },
    getTdProps: (_: Partial<Store>, rowInfo: RowInfo | undefined, column: Column | undefined) => {
      return {
        onClick: (__: SyntheticEvent, handleOriginal: () => void) => {
          if (rowInfo && column) {
            if (
              column.id === 'jurisdiction_name' &&
              hasChildren(rowInfo, parentNodes, 'jurisdiction_id')
            ) {
              setJurisdictionId(rowInfo.original.jurisdiction_id);
            }
            if (handleOriginal) {
              handleOriginal();
            }
          }
        },
      };
    },
    identifierField: 'jurisdiction_id',
    linkerField: 'jurisdiction_name',
    minRows: 0,
    parentIdentifierField: 'jurisdiction_parent_id',
    resizable: true,
    rootParentId: jurisdictionId || '',
    shouldUseEffect: false,
    showPagination: false,
    useDrillDownTrProps: false,
  };

  const currentTitle = currentJurisdictionName
    ? `${currentPageTitle}: ${currentJurisdictionName}`
    : currentPageTitle;

  return (
    <div key={`${jurisdictionId || '0'}-${data.length}`}>
      <Helmet>
        <title>{currentTitle}</title>
      </Helmet>
      <HeaderBreadcrumb {...breadcrumbProps} />
      <Row>
        <Col>
          <h3 className="mb-3 page-title">{currentTitle}</h3>
          <div className="generic-report-table">
            <DrillDownTable {...tableProps} />
          </div>
          {LegendIndicatorComp && <LegendIndicatorComp />}
        </Col>
      </Row>
    </div>
  );
};

export { GenericJurisdictionReport };