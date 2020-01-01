import { PipeTransform } from "@angular/core";
import { CdTableColumn } from './cd-table-column';

export interface CdTableColumnFilter {
  column: CdTableColumn;
  values: { raw: string, formatted: string }[];
  applied?: { raw: string, formatted: string };
}
