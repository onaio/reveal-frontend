import { get } from 'lodash';
import React from 'react';
import { Col, Row, Table } from 'reactstrap';
import { SUPERSET_IRS_REPORTING_INDICATOR_ROWS } from '../../../configs/env';
import { CONDITIONAL_FORMATTING_RULES } from '../../../configs/lang';
import {
  IndicatorThresholdItem,
  IndicatorThresholds,
  indicatorThresholdsIRS,
  IndicatorThresholdsLookUp,
  indicatorThresholdsLookUpIRS,
} from '../../../configs/settings';
import { UpdateType } from '../../../helpers/utils';
import { IndicatorThresholdItemPercentage } from '../../../helpers/utils';

interface Props {
  indicatorRows: string;
  indicatorThresholds: IndicatorThresholds;
  indicatorThresholdsLookUp: IndicatorThresholdsLookUp;
}

const defaultProps: Props = {
  indicatorRows: SUPERSET_IRS_REPORTING_INDICATOR_ROWS,
  indicatorThresholds: indicatorThresholdsIRS,
  indicatorThresholdsLookUp: indicatorThresholdsLookUpIRS,
};

const getIndicatorItems = (props: Props) => {
  const { indicatorThresholds, indicatorThresholdsLookUp, indicatorRows } = props;
  let indicatorItems = Object.values(indicatorThresholds);
  const customIndicatorThreshHolds = get(indicatorThresholdsLookUp, indicatorRows);

  if (customIndicatorThreshHolds) {
    indicatorItems = Object.values(customIndicatorThreshHolds);
  }

  return indicatorItems;
};

/** take indicator threshold and return an array of the strings representing
 * the percentage ranges.
 * @param {IndicatorThresholdItem[]} indicatorItems - The indicator threshold configurations
 */
export const generateRangeStrings = (indicatorItems: IndicatorThresholdItem[]) => {
  // sorted indicator items in ascending threshold values
  const sortedThresholds = indicatorItems.sort(
    (a: IndicatorThresholdItem, b: IndicatorThresholdItem) => (a.value > b.value ? 1 : -1)
  );

  const rangesText: Array<UpdateType<IndicatorThresholdItem, { text: string }>> = [];
  sortedThresholds.forEach((thresholdItem: IndicatorThresholdItem, index) => {
    if (index === 0) {
      // for the range on the lowest end, if threshold item includes orEqual then the range
      // symbol shall be - otherwise if orEqual is not included the range symbol shall be -<
      rangesText.push({
        ...thresholdItem,
        text: `${thresholdItem.orEquals ? '-' : '<'} ${IndicatorThresholdItemPercentage(
          thresholdItem.value
        )}`,
      });
      return;
    }
    const previousThreshold = indicatorItems[index - 1];
    /** for all other ranges, the range symbols are both dependent on this thresholdItem's
     * orEqual as well as the previous thresholdItem's orEqual boolean value.
     */
    rangesText.push({
      ...thresholdItem,
      text: `${IndicatorThresholdItemPercentage(previousThreshold.value)} ${
        previousThreshold.orEquals ? '>' : ''
      }-${thresholdItem.orEquals ? '' : '<'} ${IndicatorThresholdItemPercentage(
        thresholdItem.value
      )}`,
    });
  });

  return rangesText;
};

const IRSIndicatorLegend = (props: Props) => {
  const indicatorItems = getIndicatorItems(props);
  const reportingTableText = generateRangeStrings(indicatorItems);

  return (
    <div className="card mt-5 mb-5">
      <div className="card-header">{CONDITIONAL_FORMATTING_RULES}</div>
      <div className="card-body">
        <Row>
          <Col sm="12" md={{ size: 4, offset: 4 }}>
            <Table className="text-center">
              <tbody>
                {reportingTableText.map((item, index: number) => {
                  return (
                    <tr key={index} style={{ background: item.color }}>
                      <td>{item.name}</td>
                      <td>{item.text}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Col>
        </Row>
      </div>
    </div>
  );
};

IRSIndicatorLegend.defaultProps = defaultProps;

export default IRSIndicatorLegend;
