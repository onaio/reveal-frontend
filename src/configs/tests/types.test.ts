import React from 'react';
import { expectType } from 'tsd';
import {
  adminLayerColorsType,
  ADMN0_PCODE,
  EmptyObject,
  FlexComponent,
  GREEN_THRESHOLD,
  JurisdictionTypes,
  ORANGE_THRESHOLD,
  YELLOW_THRESHOLD,
} from '../types';

expectType<EmptyObject>({});

expectType<GREEN_THRESHOLD>(0.9);
expectType<YELLOW_THRESHOLD>(0.2);
expectType<ORANGE_THRESHOLD>(0.8);

expectType<ADMN0_PCODE>('TH');
expectType<ADMN0_PCODE>('ZM');
expectType<ADMN0_PCODE>('ra Zambia');
expectType<ADMN0_PCODE>('NA');
expectType<ADMN0_PCODE>('BW');
expectType<ADMN0_PCODE>('Chadiza');
expectType<ADMN0_PCODE>('Sinda');
expectType<ADMN0_PCODE>('Katete');
expectType<ADMN0_PCODE>('Siavonga');
expectType<ADMN0_PCODE>('Lop Buri');
expectType<ADMN0_PCODE>('Oddar Meanchey Province');
expectType<ADMN0_PCODE>('Lusaka');

expectType<adminLayerColorsType>('black');
expectType<adminLayerColorsType>('red');
expectType<adminLayerColorsType>('orange');
expectType<adminLayerColorsType>('yellow');
expectType<adminLayerColorsType>('green');

expectType<JurisdictionTypes>('administrative');
expectType<JurisdictionTypes>('operational');

class SampleComponent extends React.Component<{}> {
  public render() {
    return null;
  }
}

expectType<FlexComponent<{}>>(SampleComponent);
