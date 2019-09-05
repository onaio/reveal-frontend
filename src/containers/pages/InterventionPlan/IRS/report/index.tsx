import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Store } from 'redux';
import { RouteParams } from '../../../../../helpers/utils';
import { getPlanRecordById, Plan } from '../../../../../store/ducks/plans';

/** interface to describe props for IrsReport component */
export interface IrsReportProps {
  planById: Plan | null;
  planId: string;
}

/** default props for IrsReport component */
export const defaultIrsReportProps: IrsReportProps = {
  planById: null,
  planId: '',
};

/** Reporting for Single Active IRS Plan */
class IrsReport extends React.Component<RouteComponentProps<RouteParams> & IrsReportProps, {}> {
  public static defaultProps = defaultIrsReportProps;

  public render() {
    return null;
  }
}

export { IrsReport };

/** map state to props
 * @param {partial<store>} - the redux store
 * @param {any} ownProps - props on the component
 * @returns {IrsReportProps}
 */
const mapStateToProps = (state: Partial<Store>, ownProps: any): IrsReportProps => {
  const planId = ownProps.match.params.id || '';
  const planById = planId.length ? getPlanRecordById(state, planId) : null;
  const props = {
    planById,
    planId,
    ...ownProps,
  };

  return props as IrsReportProps;
};

/** Create connected IrsReport */
const ConnectedIrsReport = connect(mapStateToProps)(IrsReport);

export default ConnectedIrsReport;
