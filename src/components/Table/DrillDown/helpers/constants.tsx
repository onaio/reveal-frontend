/** Constants */
import React from 'react';

export const ID = 'id';
export type ID = typeof ID;

export const PARENT_ID = 'parent_id';
export type PARENT_ID = typeof PARENT_ID;

export const ROOT_PARENT_ID = null;
export type ROOT_PARENT_ID = typeof ROOT_PARENT_ID;

export const LINKER_ITEM_CSS_CLASS = 'dd-linker-item';
export type LINKER_ITEM_CSS_CLASS = typeof LINKER_ITEM_CSS_CLASS;

export const CLICKABLE_CSS_CLASS = 'dd-linker-item dd-clickable';
export type CLICKABLE_CSS_CLASS = typeof CLICKABLE_CSS_CLASS;

export const CARET_CSS_CLASS = 'dd-caret';
export type CARET_CSS_CLASS = typeof CARET_CSS_CLASS;

export const CARET_SPAN = <span className={CARET_CSS_CLASS}>&nbsp;&#9660;</span>;
export type CARET_SPAN = typeof CARET_SPAN;

export const DEFAULT_ROW_HEIGHT = '2em';
export type DEFAULT_ROW_HEIGHT = typeof DEFAULT_ROW_HEIGHT;

export const NO_DATA_FOUND = 'No Data Found';
export type NO_DATA_FOUND = typeof NO_DATA_FOUND;

export const NEXT = 'Next';
export const OF = 'Of';
export const PAGE = 'Page';
export const PREVIOUS = 'Previous';
export const ROWS_TO_DISPLAY = 'Rows to display';
export const CUSTOMIZE_COLUMNS = 'Customize Columns';
export const CUSTOMIZE_COLUMNS_FILTER_MESSAGE = 'Select the columns you want to display';
export const LOADING = 'Loading';

export const PAGE_SIZE_CATEGORIES = [10, 20, 30, 50];
