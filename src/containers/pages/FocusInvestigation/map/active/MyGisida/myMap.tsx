import * as React from 'react';
import MapGL, { Source, Layer } from 'react-map-gl';
import { DIGITAL_GLOBE_CONNECT_ID } from '../../../../../../configs/env';
import 'mapbox-gl/dist/mapbox-gl.css';
import { lineLayerConfig } from '../../../../../../configs/settings';
// import './map.css';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoib25hIiwiYSI6IlVYbkdyclkifQ.0Bz-QOOXZZK01dq4MuMImQ'; // Set your mapbox token here
// const DIGITAL_GLOBE_CONNECT_ID = '96cbb7d4-a67d-4aaa-94ce-78159bbc38f3';
const style = {
  layers: [
    {
      id: 'earthwatch-basemap',
      maxzoom: 22,
      minzoom: 0,
      source: 'diimagery',
      type: 'raster',
    },
  ],
  sources: {
    diimagery: {
      scheme: 'tms',
      tileSize: 256,
      tiles: [
        `https://access.maxar.com/earthservice/tmsaccess/tms/1.0.0/DigitalGlobe:ImageryTileService@EPSG:3857@png/{z}/{x}/{y}.png?connectId=${DIGITAL_GLOBE_CONNECT_ID}`,
      ],
      type: 'raster',
    },
  },
  version: 8,
};

export function MyMap(props: any) {
  // TODO rethink view port sizes
  const [viewport, setViewport] = React.useState({
    height: 800,
    latitude: -15,
    longitude: 28,
    width: 700,
    zoom: 11,
  });

  const _onViewportChange = (vp: any) => setViewport({ ...vp });

  const sourceAndLayers = [
    <Source type="geojson" data={wrapFC(jurisdiction) as any}>
      <Layer {...(lineLayerConfig as any)} />
    </Source>,
    ...props.layers.map((layer: any, idx: number) => (
      <Source key={layer.id} type="geojson" data={layer.data}>
        <Layer {...(circleLayerConfig as any)}></Layer>
      </Source>
    )),
  ];

  return (
    <div className="fi-map">
      <MapGL
        {...viewport}
        className="fi-map"
        mapStyle={'mapbox://styles/mapbox/light-v9'}
        onViewportChange={_onViewportChange}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        // onHover={this._onHover}
      >
        {/* <Source type="geojson" data={wrapFC() as any}>
          <Layer {...(circleLayerConfig as any)} />
        </Source> */}

        {/* <Source type="geojson" data={wrapFC(jurisdiction) as any}>
          <Layer {...(lineLayerConfig as any)} />
        </Source> */}

        {/* {props.layers.map((layer: any, idx: number) => (
          <Source key={layer.id} type="geojson" data={layer.data}>
            <Layer {...(circleLayerConfig as any)}></Layer>
          </Source>
        ))} */}
        {sourceAndLayers}

        {/* {props.sLayers.map((layer: any, idx: number) => (
          <Layer key={`${idx}-layer`} {...layer}></Layer>
        ))} */}

        {/* {props.layers.forEach((layer: any, idx: number) => {
          return (
            <Source key={`source-${idx}`} type="geojson" data={layer.data}>
              <Layer {...(circleLayerConfig as any)}></Layer>
            </Source>
          );
        })} */}
      </MapGL>
    </div>
  );
}

export const wrapFC = (arr: any) => {
  return {
    type: 'FeatureCollection',
    features: arr.map((task: any) => JSON.parse(task.geojson)),
  };
};

export const lineLayer = {
  id: 'route',
  type: 'line',
  source: 'route',
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
  paint: {
    'line-color': '#888',
    'line-width': 8,
  },
};

export const rawJurisdiction = {
  jurisdiction_id: '3951',
  geojson:
    '{"id": "3951", "type": "Feature", "geometry": {"type": "MultiPolygon", "coordinates": [[[[28.352164, -15.420254], [28.3510336, -15.4199948], [28.3506142, -15.4179685], [28.3521392, -15.4176205], [28.3523678, -15.4186171], [28.3524847, -15.4190921], [28.3523288, -15.4201825], [28.352164, -15.420254]]]]}, "properties": {"jurisdiction_name": "Akros_1", "jurisdiction_parent_id": "3019"}}',
};

export const jurisdiction = [rawJurisdiction];

export const tasks = [
  {
    task_identifier: 'aee7dc62-4ec5-4db3-9985-05f4e914f2ec',
    plan_id: '125ce534-9d84-5f94-8eb1-dd7616b7ba67',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Complete',
    geojson:
      '{"id": "aee7dc62-4ec5-4db3-9985-05f4e914f2ec", "type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[28.3514374, -15.4193609], [28.3516475, -15.4194092], [28.3516207, -15.4195178], [28.3514106, -15.4194695], [28.3514374, -15.4193609]]]}, "properties": {"goal_id": "Case_Confirmation", "plan_id": "125ce534-9d84-5f94-8eb1-dd7616b7ba67", "task_focus": "71d3349f-25d5-593d-b88d-704467e0945f", "action_code": "Case Confirmation", "task_status": "Completed", "structure_id": "154149", "task_task_for": "03137c91-7818-4a77-b2cb-f811f80c0efc", "structure_code": "154149", "structure_name": "154149", "structure_type": "Feature", "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Complete", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2020-03-30", "task_execution_start_date": "2020-03-23"}}',
  },
  {
    task_identifier: 'ae7118ca-9918-419c-a6da-4850f99b686d',
    plan_id: 'c08a318d-9b63-5b46-9ce7-ac3a4c0ade6e',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Not Visited',
    geojson:
      '{"id": "ae7118ca-9918-419c-a6da-4850f99b686d", "type": "Feature", "geometry": null, "properties": {"goal_id": "Case_Confirmation", "plan_id": "c08a318d-9b63-5b46-9ce7-ac3a4c0ade6e", "task_focus": "67119e69-f14a-590f-8df6-570a8e6e3554", "action_code": "Case Confirmation", "task_status": "Ready", "structure_id": null, "task_task_for": "3951", "structure_code": null, "structure_name": null, "structure_type": null, "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Not Visited", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2020-03-30", "task_execution_start_date": "2020-03-23"}}',
  },
  {
    task_identifier: '1d56dd3a-84df-481a-a193-3f305f98751d',
    plan_id: 'ff94ba68-70c6-4a16-bfa3-cde22befdb63',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Not Visited',
    geojson:
      '{"id": "1d56dd3a-84df-481a-a193-3f305f98751d", "type": "Feature", "geometry": null, "properties": {"goal_id": "Case_Confirmation", "plan_id": "ff94ba68-70c6-4a16-bfa3-cde22befdb63", "task_focus": "d913c234-110b-40d4-9fa0-41c88d137c3e", "action_code": "Case Confirmation", "task_status": "Ready", "structure_id": null, "task_task_for": "3951", "structure_code": null, "structure_name": null, "structure_type": null, "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Not Visited", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2019-09-19", "task_execution_start_date": "2019-09-09"}}',
  },
  {
    task_identifier: '210df2c5-de35-4d2b-8d5b-c2213fc8c2ee',
    plan_id: '92420647-8b4d-47d5-8324-6d6c0498bfe2',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Not Visited',
    geojson:
      '{"id": "210df2c5-de35-4d2b-8d5b-c2213fc8c2ee", "type": "Feature", "geometry": null, "properties": {"goal_id": "Case_Confirmation", "plan_id": "92420647-8b4d-47d5-8324-6d6c0498bfe2", "task_focus": "e7b68df8-3964-4096-a878-00f75e708beb", "action_code": "Case Confirmation", "task_status": "Ready", "structure_id": null, "task_task_for": "3951", "structure_code": null, "structure_name": null, "structure_type": null, "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Not Visited", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2019-09-19", "task_execution_start_date": "2019-09-09"}}',
  },
  {
    task_identifier: '2857112b-0111-4104-911e-8badb8779e42',
    plan_id: 'e223f704-ab03-49ff-9d1f-20ed094d9f33',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Not Visited',
    geojson:
      '{"id": "2857112b-0111-4104-911e-8badb8779e42", "type": "Feature", "geometry": null, "properties": {"goal_id": "Case_Confirmation", "plan_id": "e223f704-ab03-49ff-9d1f-20ed094d9f33", "task_focus": "a821a4d1-666c-48ed-8c03-a050c7380fee", "action_code": "Case Confirmation", "task_status": "Ready", "structure_id": null, "task_task_for": "3951", "structure_code": null, "structure_name": null, "structure_type": null, "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Not Visited", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2019-09-19", "task_execution_start_date": "2019-09-09"}}',
  },
  {
    task_identifier: 'b421e054-b2b1-443b-b0b8-14bdfb6a1ad6',
    plan_id: '02b3629b-8eb8-531a-ada4-2dfa541f1dcf',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Complete',
    geojson:
      '{"id": "b421e054-b2b1-443b-b0b8-14bdfb6a1ad6", "type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[28.3512898, -15.4182898], [28.3513309, -15.4182819], [28.3513454, -15.4183521], [28.3510395, -15.4184111], [28.3510239, -15.4183359], [28.3511749, -15.4183068], [28.35116, -15.418235], [28.3512739, -15.4182131], [28.3512898, -15.4182898]]]}, "properties": {"goal_id": "Case_Confirmation", "plan_id": "02b3629b-8eb8-531a-ada4-2dfa541f1dcf", "task_focus": "608d4d53-0276-5c7d-9333-635c96a7e839", "action_code": "Case Confirmation", "task_status": "Completed", "structure_id": "154142", "task_task_for": "8492a2c5-35d5-4669-92a7-0ba20d10a31d", "structure_code": "154142", "structure_name": "154142", "structure_type": "Feature", "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Complete", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2020-03-30", "task_execution_start_date": "2020-03-23"}}',
  },
  {
    task_identifier: '02035ac9-09f3-4698-b916-95eea0dbba42',
    plan_id: 'c8a6a307-2403-556e-bf47-d8db2b100180',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Complete',
    geojson:
      '{"id": "02035ac9-09f3-4698-b916-95eea0dbba42", "type": "Feature", "geometry": {"type": "Point", "coordinates": [28.3517041814393, -15.4191251286028]}, "properties": {"goal_id": "Case_Confirmation", "plan_id": "c8a6a307-2403-556e-bf47-d8db2b100180", "task_focus": "63f94189-e51b-5f13-b64c-252aeceb4876", "action_code": "Case Confirmation", "task_status": "Completed", "structure_id": "f3b0a597-6d35-40d4-a342-1fce938ef517", "task_task_for": "c74dc359-28f9-4873-90f4-70b8db55ebd0", "structure_code": "f3b0a597-6d35-40d4-a342-1fce938ef517", "structure_name": "f3b0a597-6d35-40d4-a342-1fce938ef517", "structure_type": "Feature", "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Complete", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2020-04-06", "task_execution_start_date": "2020-03-30"}}',
  },
  {
    task_identifier: '313895a4-e5e6-4897-b76e-3c72e4841b6d',
    plan_id: '23661d4c-08d0-49f0-8f25-22b2754c56d8',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Not Visited',
    geojson:
      '{"id": "313895a4-e5e6-4897-b76e-3c72e4841b6d", "type": "Feature", "geometry": null, "properties": {"goal_id": "Case_Confirmation", "plan_id": "23661d4c-08d0-49f0-8f25-22b2754c56d8", "task_focus": "483fdb4b-f7f6-49a4-8613-5f0ad05a5b19", "action_code": "Case Confirmation", "task_status": "Ready", "structure_id": null, "task_task_for": "3951", "structure_code": null, "structure_name": null, "structure_type": null, "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Not Visited", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2019-09-19", "task_execution_start_date": "2019-09-09"}}',
  },
  {
    task_identifier: '32f0160c-1d43-4779-9168-0c5ba4d8a5aa',
    plan_id: '3bebdc80-c8e3-4cad-85f2-4e69182aab32',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Not Visited',
    geojson:
      '{"id": "32f0160c-1d43-4779-9168-0c5ba4d8a5aa", "type": "Feature", "geometry": null, "properties": {"goal_id": "Case_Confirmation", "plan_id": "3bebdc80-c8e3-4cad-85f2-4e69182aab32", "task_focus": "e39c7f03-e38b-4296-a1ac-4e3ef3df7385", "action_code": "Case Confirmation", "task_status": "Ready", "structure_id": null, "task_task_for": "3951", "structure_code": null, "structure_name": null, "structure_type": null, "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Not Visited", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2019-09-19", "task_execution_start_date": "2019-09-09"}}',
  },
  {
    task_identifier: '1c13b985-0f45-40bb-9c63-45b4a7bcdbc7',
    plan_id: '7b6f9214-e4e8-525e-b7af-df593f0ea034',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Not Visited',
    geojson:
      '{"id": "1c13b985-0f45-40bb-9c63-45b4a7bcdbc7", "type": "Feature", "geometry": null, "properties": {"goal_id": "Case_Confirmation", "plan_id": "7b6f9214-e4e8-525e-b7af-df593f0ea034", "task_focus": "18216de5-2c7d-53ef-8ff9-563a8fb342d4", "action_code": "Case Confirmation", "task_status": "Ready", "structure_id": null, "task_task_for": "3951", "structure_code": null, "structure_name": null, "structure_type": null, "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Not Visited", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2020-04-07", "task_execution_start_date": "2020-03-31"}}',
  },
  {
    task_identifier: '4e1fefce-805d-4906-918d-d6accaa40601',
    plan_id: '4275102c-ef7c-465b-a210-e765ba630bf4',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Not Visited',
    geojson:
      '{"id": "4e1fefce-805d-4906-918d-d6accaa40601", "type": "Feature", "geometry": null, "properties": {"goal_id": "Case_Confirmation", "plan_id": "4275102c-ef7c-465b-a210-e765ba630bf4", "task_focus": "c0fb9191-3d69-4080-9c9c-081852679b57", "action_code": "Case Confirmation", "task_status": "Ready", "structure_id": null, "task_task_for": "3951", "structure_code": null, "structure_name": null, "structure_type": null, "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Not Visited", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2019-09-19", "task_execution_start_date": "2019-09-09"}}',
  },
  {
    task_identifier: '511be78e-fc8a-11e9-8f0b-362b9e155667',
    plan_id: 'a8b3010c-1ba5-556d-8b16-71266397b8b9',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Not Visited',
    geojson:
      '{"id": "511be78e-fc8a-11e9-8f0b-362b9e155667", "type": "Feature", "geometry": null, "properties": {"goal_id": "Case_Confirmation", "plan_id": "a8b3010c-1ba5-556d-8b16-71266397b8b9", "task_focus": "3951", "action_code": "Case Confirmation", "task_status": "Ready", "structure_id": null, "task_task_for": "3951", "structure_code": null, "structure_name": null, "structure_type": null, "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Not Visited", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2019-12-21", "task_execution_start_date": "2019-11-01"}}',
  },
  {
    task_identifier: '52bda9e3-6009-405e-81d7-f5f322f8096b',
    plan_id: '77895afb-539a-5b3e-9066-87dfc4fe2b60',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Not Visited',
    geojson:
      '{"id": "52bda9e3-6009-405e-81d7-f5f322f8096b", "type": "Feature", "geometry": null, "properties": {"goal_id": "Case_Confirmation", "plan_id": "77895afb-539a-5b3e-9066-87dfc4fe2b60", "task_focus": "672143cf-a853-5cad-a08e-38fe649bf233", "action_code": "Case Confirmation", "task_status": "Ready", "structure_id": null, "task_task_for": "3951", "structure_code": null, "structure_name": null, "structure_type": null, "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Not Visited", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2020-02-25", "task_execution_start_date": "2020-02-18"}}',
  },
  {
    task_identifier: '5b6aab91-b868-4f18-a9e1-3e1230d83a93',
    plan_id: '31308deb-1faf-4ac2-9ddb-d2775e57cb9b',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Not Visited',
    geojson:
      '{"id": "5b6aab91-b868-4f18-a9e1-3e1230d83a93", "type": "Feature", "geometry": null, "properties": {"goal_id": "Case_Confirmation", "plan_id": "31308deb-1faf-4ac2-9ddb-d2775e57cb9b", "task_focus": "786621f0-feac-4469-9fa6-92d654b293b3", "action_code": "Case Confirmation", "task_status": "Ready", "structure_id": null, "task_task_for": "3951", "structure_code": null, "structure_name": null, "structure_type": null, "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Not Visited", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2019-09-19", "task_execution_start_date": "2019-09-09"}}',
  },
  {
    task_identifier: '6000b126-9a5e-45ae-befc-6787c148cd3d',
    plan_id: 'c2676067-090e-4fa3-a578-8b6b0138d09b',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Not Visited',
    geojson:
      '{"id": "6000b126-9a5e-45ae-befc-6787c148cd3d", "type": "Feature", "geometry": null, "properties": {"goal_id": "Case_Confirmation", "plan_id": "c2676067-090e-4fa3-a578-8b6b0138d09b", "task_focus": "8d75bca7-7ff0-45ca-bc1b-639431023710", "action_code": "Case Confirmation", "task_status": "Ready", "structure_id": null, "task_task_for": "3951", "structure_code": null, "structure_name": null, "structure_type": null, "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Not Visited", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2019-09-16", "task_execution_start_date": "2019-09-06"}}',
  },
  {
    task_identifier: 'f3ad033e-9f77-4255-83b0-41bfee5aeea5',
    plan_id: 'a8b3010c-1ba5-556d-8b16-71266397b8b9',
    jurisdiction_id: '3951',
    goal_id: 'Case_Confirmation',
    action_code: 'Case Confirmation',
    task_business_status: 'Complete',
    geojson:
      '{"id": "f3ad033e-9f77-4255-83b0-41bfee5aeea5", "type": "Feature", "geometry": null, "properties": {"goal_id": "Case_Confirmation", "plan_id": "a8b3010c-1ba5-556d-8b16-71266397b8b9", "task_focus": "ae158ee0-dbd1-5eb9-ae4b-cc3f1f7805fc", "action_code": "Case Confirmation", "task_status": "Completed", "structure_id": null, "task_task_for": "864381e4-bcef-4173-a638-dd86a4c130d3", "structure_code": null, "structure_name": null, "structure_type": null, "jurisdiction_id": "3951", "jurisdiction_name": "Akros_1", "task_business_status": "Complete", "jurisdiction_parent_id": "3019", "task_execution_end_date": "2019-11-08", "task_execution_start_date": "2019-11-01"}}',
  },
];

/** Circle layer configuration */
export const circleLayerConfig = {
  categories: {
    color: '#ff0000',
  },
  id: 'single-jurisdiction',
  paint: {
    'circle-color': '#FFDC00',
    'circle-opacity': 0.7,
    'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 15.75, 2.5, 20.8, 50],
    'circle-stroke-width': 2,
  },
  type: 'circle',
  // visible: false,
};

// export default class App extends Component {
//   state = {
//     year: 2015,
//     data: null,
//     hoveredFeature: null,
//     viewport: {
//       latitude: 40,
//       longitude: -100,
//       zoom: 3,
//       bearing: 0,
//       pitch: 0
//     }
//   };

//   componentDidMount() {
//     requestJson(
//       'https://raw.githubusercontent.com/uber/react-map-gl/master/examples/.data/us-income.geojson',
//       (error, response) => {
//         if (!error) {
//           this._loadData(response);
//         }
//       }
//     );
//   }

//   _loadData = data => {
//     this.setState({
//       data: updatePercentiles(data, f => f.properties.income[this.state.year])
//     });
//   };

//   _updateSettings = (name, value) => {
//     if (name === 'year') {
//       this.setState({year: value});

//       const {data} = this.state;
//       if (data) {
//         // trigger update
//         this.setState({
//           data: updatePercentiles(data, f => f.properties.income[value])
//         });
//       }
//     }
//   };

//   _onViewportChange = viewport => this.setState({viewport});

//   _onHover = event => {
//     const {
//       features,
//       srcEvent: {offsetX, offsetY}
//     } = event;
//     const hoveredFeature = features && features.find(f => f.layer.id === 'data');

//     this.setState({hoveredFeature, x: offsetX, y: offsetY});
//   };

//   _renderTooltip() {
//     const {hoveredFeature, x, y} = this.state;

//     return (
//       hoveredFeature && (
//         <div className="tooltip" style={{left: x, top: y}}>
//           <div>State: {hoveredFeature.properties.name}</div>
//           <div>Median Household Income: {hoveredFeature.properties.value}</div>
//           <div>Percentile: {(hoveredFeature.properties.percentile / 8) * 100}</div>
//         </div>
//       )
//     );
//   }

//   render() {
//     const {viewport, data} = this.state;

//     return (
//       <div style={{height: '100%', position: 'relative'}}>
//         <MapGL
//           {...viewport}
//           width="100%"
//           height="100%"
//           mapStyle={style}
//           onViewportChange={this._onViewportChange}
//           mapboxApiAccessToken={MAPBOX_TOKEN}
//           onHover={this._onHover}
//         >
//           <Source type="geojson" data={data}>
//             <Layer {...dataLayer} />
//           </Source>
//           {this._renderTooltip()}
//           <Source type='geojson' data={wrapFC()}>
//             <Layer {...circleLayerConfig} />
//           </Source>
//         </MapGL>

//         <ControlPanel
//           containerComponent={this.props.containerComponent}
//           settings={this.state}
//           onChange={this._updateSettings}
//         />
//       </div>
//     );
//   }
// }

// export function renderToDom(container) {
//   render(<App />, container);
// }
