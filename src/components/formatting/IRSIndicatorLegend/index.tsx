import React from 'react';
import { Col, Row, Table } from 'reactstrap';
import { CONDITIONAL_FORMATTING_RULES } from '../../../configs/lang';
import {
  IndicatorThresholdItem,
  IndicatorThresholds,
  indicatorThresholdsIRS,
} from '../../../configs/settings';
import { percentage } from '../../../helpers/utils';

interface Props {
  indicatorThresholds: IndicatorThresholds;
}

const defaultProps: Props = {
  indicatorThresholds: indicatorThresholdsIRS,
};

const IRSIndicatorLegend = (props: Props) => {
  const { indicatorThresholds } = props;
  const indicatorItems = Object.values(indicatorThresholds);

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
