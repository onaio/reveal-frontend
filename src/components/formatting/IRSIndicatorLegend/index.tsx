import React from 'react';
import { Table } from 'reactstrap';
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

  return (
    <div>
      <h5 className="mt-4 mb-3">IRS Conditional Formatting</h5>
      <div className="row">
        <div className="col-3">
          <Table className="text-center">
            <tbody>
              {Object.values(indicatorThresholds)
                .sort((a: IndicatorThresholdItem, b: IndicatorThresholdItem) =>
                  a.value > b.value ? 1 : -1
                )
                .map((item, index) => {
                  return (
                    <tr key={index} style={{ background: item.color }}>
                      <td>{item.name}</td>
                      <td>>=</td>
                      <td>{percentage(item.value)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

IRSIndicatorLegend.defaultProps = defaultProps;

export default IRSIndicatorLegend;
