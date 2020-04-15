import React from 'react';
import { Table } from 'reactstrap';
import * as colors from '../../colors';
import { CONDITIONAL_FORMATTING_TITLE, FI_RESPONSE_ADHERENCE_TITLE } from '../../configs/lang';
import { GREEN_THRESHOLD, ORANGE_THRESHOLD, YELLOW_THRESHOLD } from '../../configs/settings';
import { GREEN, ORANGE, RED, YELLOW } from '../../constants';
import { IndicatorThresholdItemPercentage } from '../../helpers/utils';

/** Displays conditional formatting guide for Focus Investigation Response Adherence */
const ResponseAdherence: React.ElementType = () => {
  return (
    <div>
      <h5 className="mt-4 mb-3">{CONDITIONAL_FORMATTING_TITLE}</h5>
      <h6 className="mb-3">{FI_RESPONSE_ADHERENCE_TITLE}</h6>
      <div className="row">
        <div className="col-3">
          <Table className="text-center">
            <tbody>
              <tr style={{ background: colors.GREEN }}>
                <td>{GREEN}</td>
                <td>>=</td>
                <td>{IndicatorThresholdItemPercentage(GREEN_THRESHOLD)}</td>
              </tr>
              <tr style={{ background: colors.ORANGE }}>
                <td>{ORANGE}</td>
                <td>{IndicatorThresholdItemPercentage(GREEN_THRESHOLD)}</td>
                <td>{IndicatorThresholdItemPercentage(ORANGE_THRESHOLD)}</td>
              </tr>
              <tr style={{ background: colors.RED }}>
                <td>{RED}</td>
                <td>{IndicatorThresholdItemPercentage(ORANGE_THRESHOLD)}</td>
                <td>{IndicatorThresholdItemPercentage(YELLOW_THRESHOLD)}</td>
              </tr>
              <tr style={{ background: colors.YELLOW }}>
                <td>{YELLOW}</td>
                <td>>=</td>
                <td>{IndicatorThresholdItemPercentage(YELLOW_THRESHOLD)}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ResponseAdherence;
