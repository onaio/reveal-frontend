import ListView from '@onaio/list-view';
import React, { useEffect, useState } from 'react';
import Loading from '../../components/page/Loading';
import { NO_ROWS_FOUND } from '../../configs/lang';
import { displayError } from '../../helpers/errors';
import supersetFetch from '../../services/superset';
import {
  FetchMDAPointLocationReportAction,
  LocationReport,
} from '../../store/ducks/generic/MDALocationsReport';

export interface GenericSupersetDataTableProps {
  data: React.ReactNode[][];
  fetchItems: typeof FetchMDAPointLocationReportAction;
  headerItems: React.ReactNode[];
  service: typeof supersetFetch;
  supersetSliceId: string;
  tableClass?: string;
}

export const GenericSupersetDataTable = (props: GenericSupersetDataTableProps) => {
  const { supersetSliceId, fetchItems, service, data, headerItems, tableClass } = props;

  const [loading, setLoading] = useState<boolean>(false);

  /** async function to load the data */
  async function loadData() {
    try {
      setLoading(data.length < 1); // only set loading when there are no records
      await service(supersetSliceId).then((result: LocationReport[]) => {
        fetchItems(result);
      });
    } catch (e) {
      // do something with the error?
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

  if (loading === true) {
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
