import { Popup } from 'mapbox-gl';
import { buildMouseMoveHandler, buildOnClickHandler } from '../helpers/utils';

const popupHandlerMock = buildOnClickHandler('');

window.URL.createObjectURL = jest.fn();

describe('activeFIMap/helpers/utils.popup', () => {
  it('calls queryRenderedFeatures', () => {
    const event = {
      lngLat: {
        lat: 15.065355545319008,
        lng: 101.1799767158821,
      },
      originalEvent: undefined,
      point: {
        x: 463.5,
        y: 477.1875,
      },
      target: {
        queryRenderedFeatures: () => {
          return [
            {
              geometry: {
                coordinates: [101.17997825145721, 15.065285996883986],
                type: 'Point',
              },
              layer: {
                id: 'x',
                type: 'fill',
              },
              properties: {
                action_code: 'Bednet Distribution',
                color: '#ff3',
                goal_id: 'RACD_bednet_dist_1km_radius',
                jurisdiction_id: '450fc15b-5bd2-468a-927a-49cb10d3bcac',
                jurisdiction_name: 'TLv1_01',
                jurisdiction_parent_id: 'dad42fa6-b9b8-4658-bf25-bfa7ab5b16ae',
                plan_id: '10f9e9fa-ce34-4b27-a961-72fab5206ab6',
                structure_code: 'f33918f1-7165-4579-b096-165e75f7e1e0',
                structure_id: 'f33918f1-7165-4579-b096-165e75f7e1e0',
                structure_name: 'f33918f1-7165-4579-b096-165e75f7e1e0',
                structure_type: 'Residential Structure',
                task_business_status: 'Not Visited',
                task_execution_end_date: '2019-06-21',
                task_execution_start_date: '2019-06-17',
                task_focus: 'Bednet Distribution',
                task_status: 'Ready',
                task_task_for: 'f33918f1-7165-4579-b096-165e75f7e1e0',
              },
              source: 'RACD_bednet_dist_1km_radius',
              state: {},
              type: 'Feature',
            },
          ];
        },
      },
      type: 'fill',
    };

    const mockedPopup = Popup;
    const addToMock = jest.fn();
    mockedPopup.prototype.setLngLat = (e: any) => {
      expect(e).toEqual({
        lat: 15.065355545319008,
        lng: 101.1799767158821,
      });
      e.setHTML = (f: string) => {
        expect(f).toEqual(
          '<div><p class="heading">Bednet Distribution</b></p><p>Not Visited</p><br/><br/></div>'
        );
        e.addTo = addToMock;
        return e;
      };
      return e;
    };

    (global as any).mapboxgl = {
      Popup: mockedPopup,
    };

    const mockMap: any = {};

    popupHandlerMock(mockMap, event as any);

    expect(addToMock).toHaveBeenCalledWith({});
  });
  it('shows popup on hover', () => {
    const event = {
      lngLat: {
        lat: 15.065355545319008,
        lng: 101.1799767158821,
      },
      originalEvent: {},
      point: {
        x: 463.5,
        y: 477.1875,
      },
      target: {
        queryRenderedFeatures: () => {
          return [
            {
              geometry: {
                coordinates: [
                  [
                    [101.16072535514832, 15.119824869285075],
                    [101.15796539300004, 15.052626968000027],
                    [101.16026588800008, 15.052683043000059],
                    [101.16249336800007, 15.05279176700003],
                    [101.16457351200006, 15.05287588400006],
                    [101.16817184600006, 15.053010455000049],
                    [101.16992435000009, 15.05309115600005],
                    [101.16997576800009, 15.052226568000037],
                    [101.17015797000005, 15.050841579000064],
                    [101.17258921900009, 15.050799469000026],
                    [101.17424499900005, 15.050698872000055],
                    [101.17613469500009, 15.050485078000065],
                    [101.17699562400009, 15.050437232000036],
                  ],
                ],
                type: 'Polygon',
              },
              id: '8fb28715-6c80-4e2c-980f-422798fe9f41',
              properties: {
                geographicLevel: 3,
                name: 'Two Three Two Release Village',
                parentId: '872cc59e-0bce-427a-bd1f-6ef674dba8e2',
                status: 'Active',
                version: 0,
              },
              type: 'Feature',
            },
          ];
        },
      },
      type: 'fill',
    };

    const mockedPopup = Popup;
    const addToMock = jest.fn();
    mockedPopup.prototype.setLngLat = (e: any) => {
      expect(e).toEqual({
        lat: 15.065355545319008,
        lng: 101.1799767158821,
      });
      e.setHTML = (f: string) => {
        expect(f).toEqual(
          '<div class="jurisdiction-name"><center>Two Three Two Release Village</center></div>'
        );
        e.addTo = addToMock;
        return e;
      };
      return e;
    };

    (global as any).mapboxgl = {
      Popup: mockedPopup,
    };

    const mockStyle = {
      cursor: 'pointer',
    };

    const mockMap: any = {
      // mock unproject function
      getCanvas: jest.fn().mockImplementation(() => {
        return {
          style: {
            ...mockStyle,
          },
        };
      }),
      unproject: () => {
        return {
          lat: 15.065355545319008,
          lng: 101.1799767158821,
        };
      },
    };

    buildMouseMoveHandler(mockMap, event as any);

    expect(addToMock.mock.calls).toEqual([
      [{ getCanvas: expect.any(Function), unproject: expect.any(Function) }],
    ]);
    expect(addToMock).toBeCalledTimes(1);
  });
});
