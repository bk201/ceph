import { PipeTransform } from "@angular/core";

export interface ColumnFilter {
  label: string
  prop: string
  values: { raw: string, formatted: string }[],
  applied?: { raw: string, formatted: string },
  pipe?: PipeTransform
}
