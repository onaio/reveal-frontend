import ListView from '@onaio/list-view';
import React, { useEffect, useState } from 'react';
import Loading from '../../../../../components/page/Loading';
import { NO_ROWS_FOUND } from '../../../../../configs/lang';
import { displayError } from '../../../../../helpers/errors';
import supersetFetch from '../../../../../services/superset';
import {
  ChildReport,
  FetchMDAPointChildReportAction,
} from '../../../../../store/ducks/generic/MDAChildReport';

export interface ChildSupersetDataTableProps {
  data: React.ReactNode[][];
  fetchItems: typeof FetchMDAPointChildReportAction;
  headerItems: React.ReactNode[];
  service: typeof supersetFetch;
  supersetSliceId: string;
  tableClass?: string;
}

export const ChildSupersetDataTable = (props: ChildSupersetDataTableProps) => {
  const { supersetSliceId, fetchItems, service, data, headerItems, tableClass } = props;

  const [loading, setLoading] = useState<boolean>(false);

  /** async function to load the data */
  async function loadData() {
    try {
      setLoading(data.length < 1);
      await service(supersetSliceId).then((result: ChildReport[]) => {
        fetchItems(result);
      });
    } catch (e) {
      displayError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData().catch(error => displayError(error));
  }, []);

  const listViewProps = {
    data,
    headerItems,
    tableClass: tableClass || 'table table-striped table-bordered plans-list',
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <ListView {...listViewProps} />
      {!data.length && (
        <div style={{ textAlign: 'center' }}>
          {NO_ROWS_FOUND}
          <hr />
        </div>
      )}
    </div>
  );
};
