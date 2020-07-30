import { renderTable } from '@onaio/drill-down-table';
import { mount } from 'enzyme';
import React from 'react';
import { BaseListComponent } from '..';
import { PlanRecord } from '../../../../../../../store/ducks/plans';
import { draftPageColumns } from '../../utils';

describe('src/../pages/InterventionPlan/PlanningView/helpers', () => {
  it('base list is renders correctly', () => {
    const props = {
      plansArray: [],
    };

    const wrapper = mount(<BaseListComponent {...props} />);

    renderTable(wrapper, 'should have no data');
    expect(wrapper.text()).toMatchInlineSnapshot(`"NameDate CreatedStatusNo Data Found"`);
  });

  it('base list with props is rendered correctly', () => {
    const loadDataMock = (setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
      setLoading(false);
    };
    const noDataMessage = 'just blank';
    const getTableProps = (loading: boolean, data: PlanRecord[]) => {
      return {
        columns: draftPageColumns,
        data,
        loading,
        loadingComponent: () => <>Loading...</>,
        renderNullDataComponent: () => <>{noDataMessage}</>,
        useDrillDown: false,
      };
    };
    const props = {
      getTableProps,
      loadData: loadDataMock,
      plansArray: [],
    };

    const wrapper = mount(<BaseListComponent {...props} />);

    renderTable(wrapper, 'Has no data');
    expect(wrapper.text().includes(noDataMessage)).toBeTruthy();
  });
});
