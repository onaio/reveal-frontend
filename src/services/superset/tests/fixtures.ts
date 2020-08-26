/* tslint:disable:object-literal-sort-keys */

export const sliceResponse = {
  cache_key: null,
  cache_timeout: 86400,
  cached_dttm: null,
  columns: ['ad_number', 'general_info_info_data_giq3'],
  data: {
    records: [
      {
        ad_number: 'PD1',
        general_info_info_data_giq3: 'Kabul',
      },
      {
        ad_number: 'PD10',
        general_info_info_data_giq3: 'Kabul',
      },
      {
        ad_number: 'PD11',
        general_info_info_data_giq3: 'Kabul',
      },
      {
        ad_number: 'PD12',
        general_info_info_data_giq3: 'Kabul',
      },
      {
        ad_number: 'PD13',
        general_info_info_data_giq3: 'Kabul',
      },
      {
        ad_number: 'PD15',
        general_info_info_data_giq3: 'Kabul',
      },
    ],
  },
  error: null,
  is_cached: false,
  rowcount: 6,
  stacktrace: null,
  status: 'success',
};

export const parsedSliceResponse = [
  {
    ad_number: 'PD1',
    general_info_info_data_giq3: 'Kabul',
  },
  {
    ad_number: 'PD10',
    general_info_info_data_giq3: 'Kabul',
  },
  {
    ad_number: 'PD11',
    general_info_info_data_giq3: 'Kabul',
  },
  {
    ad_number: 'PD12',
    general_info_info_data_giq3: 'Kabul',
  },
  {
    ad_number: 'PD13',
    general_info_info_data_giq3: 'Kabul',
  },
  {
    ad_number: 'PD15',
    general_info_info_data_giq3: 'Kabul',
  },
];

export const noDataResponse = {
  cache_key: null,
  cached_dttm: null,
  cache_timeout: 60,
  error: 'No data',
  form_data: {
    datasource: '119__table',
    viz_type: 'table',
    granularity_sqla: null,
    time_grain_sqla: 'P1D',
    time_range: '100 years ago : ',
    groupby: [],
    metrics: [],
    percent_metrics: [],
    timeseries_limit_metric: null,
    row_limit: 15000,
    include_time: false,
    order_desc: true,
    all_columns: ['task_identifier', 'plan_id', 'jurisdiction_id', 'goal_id', 'geojson'],
    order_by_cols: [],
    adhoc_filters: [
      {
        clause: 'WHERE',
        expressionType: 'SIMPLE',
        comparator: 'cb5f9664-8448-57b7-8380-f8613bd268de',
        operator: '==',
        subject: 'plan_id',
      },
    ],
    table_timestamp_format: '%Y-%m-%d %H:%M:%S',
    page_length: 0,
    include_search: false,
    table_filter: false,
    align_pn: false,
    color_pn: true,
    slice_id: 586,
    where: '',
    having: '',
    having_filters: [],
    filters: [{ col: 'plan_id', op: '==', val: 'cb5f9664-8448-57b7-8380-f8613bd268de' }],
  },
  is_cached: false,
  query:
    "SELECT task_identifier AS task_identifier,\n       plan_id AS plan_id,\n       jurisdiction_id AS jurisdiction_id,\n       goal_id AS goal_id,\n       geojson AS geojson\nFROM\n  (SELECT task_identifier,\n          plan_id,\n          jurisdiction_id,\n          goal_id,\n          jsonb_build_object('type', 'Feature', 'id', task_identifier, 'geometry', ST_AsGeoJSON(structure_geometry)::jsonb, 'properties', to_jsonb(row) - 'task_identifier' - 'structure_geometry') AS geojson\n   FROM\n     (SELECT task_identifier,\n             plan_id,\n             jurisdiction_id,\n             task_status,\n             task_business_status,\n             task_focus,\n             task_task_for,\n             task_execution_start_date,\n             task_execution_end_date,\n             goal_id,\n             action_code,\n             jurisdiction_name,\n             jurisdiction_parent_id,\n             structure_id,\n             structure_code,\n             structure_name,\n             structure_type,\n             structure_geometry\n      FROM reveal_stage.task_structures_materialized_view) row) AS expr_qry\nWHERE plan_id = 'cb5f9664-8448-57b7-8380-f8613bd268de'\nLIMIT 15000;",
  status: 'success',
  stacktrace: null,
  rowcount: 0,
};
