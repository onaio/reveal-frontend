import { expectAssignable, expectType } from 'tsd';
import {
  adminLayerColorsType,
  ADMN0_PCODE,
  EmptyObject,
  GREEN_THRESHOLD,
  JurisdictionTypes,
  ORANGE_THRESHOLD,
  YELLOW_THRESHOLD,
} from '../configs/types';

expectType<EmptyObject>({});

expectType<GREEN_THRESHOLD>(0.9);
expectType<YELLOW_THRESHOLD>(0.2);
expectType<ORANGE_THRESHOLD>(0.8);

expectAssignable<ADMN0_PCODE>('TH');
expectAssignable<ADMN0_PCODE>('ZM');
expectAssignable<ADMN0_PCODE>('ra Zambia');
expectAssignable<ADMN0_PCODE>('NA');
expectAssignable<ADMN0_PCODE>('BW');
expectAssignable<ADMN0_PCODE>('Chadiza');
expectAssignable<ADMN0_PCODE>('Sinda');
expectAssignable<ADMN0_PCODE>('Katete');
expectAssignable<ADMN0_PCODE>('Siavonga');
expectAssignable<ADMN0_PCODE>('Lop Buri');
expectAssignable<ADMN0_PCODE>('Oddar Meanchey Province');
expectAssignable<ADMN0_PCODE>('Lusaka');

expectAssignable<adminLayerColorsType>('black');
expectAssignable<adminLayerColorsType>('red');
expectAssignable<adminLayerColorsType>('orange');
expectAssignable<adminLayerColorsType>('yellow');
expectAssignable<adminLayerColorsType>('green');

expectAssignable<JurisdictionTypes>('administrative');
expectAssignable<JurisdictionTypes>('operational');
