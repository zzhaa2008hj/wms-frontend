/**
 * Created by Hui on 2017/6/15.
 */
export interface Dictionary {
  id?: string;
  dictCode: string;
  status: boolean;
  orgId: string;

  // Dictionary
  dictName: string;
  remark: string;

  // DictionaryData
  dictDataCode: string;
  dictDataName: string;
  description: string;
  sort: number;
}