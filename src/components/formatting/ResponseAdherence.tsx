import React from 'react';
import { Table } from 'reactstrap';
import * as colors from '../../colors';
import { GREEN_THRESHOLD, ORANGE_THRESHOLD, YELLOW_THRESHOLD } from '../../configs/settings';
import { GREEN, ORANGE, RED, YELLOW } from '../../constants';
import { percentage } from '../../helpers/utils';

/** Displays conditional formatting guide for Focus Investigation Response Adherence */
const ResponseAdherence: React.ElementType = props => {
  return (
    <div>
      <h5 className="mt-4 mb-3">Conditional Formatting</h5>
      <h6 className="mb-3">FI Response Adherence</h6>
      <div className="row">
        <div className="col-3">
          <Table className="text-center">
            <tbody>
              <tr style={{ background: colors.GREEN }}>
                <td>{GREEN}</td>
                <td>>=</td>
                <td>{percentage(GREEN_THRESHOLD)}</td>
              </tr>
              <tr style={{ background: colors.ORANGE }}>
                <td>{ORANGE}</td>
                <td>{percentage(GREEN_THRESHOLD)}</td>
                <td>{percentage(ORANGE_THRESHOLD)}</td>
              </tr>
              <tr style={{ background: colors.RED }}>
                <td>{RED}</td>
                <td>{percentage(ORANGE_THRESHOLD)}</td>
                <td>{percentage(YELLOW_THRESHOLD)}</td>
              </tr>
              <tr style={{ background: colors.YELLOW }}>
                <td>{YELLOW}</td>
                <td>>=</td>
                <td>{percentage(YELLOW_THRESHOLD)}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ResponseAdherence;
