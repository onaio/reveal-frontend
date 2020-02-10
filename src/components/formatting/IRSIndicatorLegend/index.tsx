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
import { percentage } from '../../../helpers/utils';

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

const IRSIndicatorLegend = (props: Props) => {
  const indicatorItems = getIndicatorItems(props);

  return (
    <div className="card mt-5 mb-5">
      <div className="card-header">{CONDITIONAL_FORMATTING_RULES}</div>
      <div className="card-body">
        <Row>
          <Col sm="12" md={{ size: 4, offset: 4 }}>
            <Table className="text-center">
              <tbody>
                {indicatorItems
                  .sort((a: IndicatorThresholdItem, b: IndicatorThresholdItem) =>
                    a.value > b.value ? 1 : -1
                  )
                  .map((item, index) => {
                    return (
                      <tr key={index} style={{ background: item.color }}>
                        <td>{item.name}</td>
                        <td>
                          {index === 0
                            ? `< ${percentage(item.value)}`
                            : `${percentage(indicatorItems[index - 1].value)} - ${percentage(
                                item.value
                              )}`}
                        </td>
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
