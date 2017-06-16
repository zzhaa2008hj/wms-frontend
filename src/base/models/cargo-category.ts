/**
 * Created by Hui on 2017/6/15.
 */
export interface CargoCategory {
  id?: string;
  parentId?: string;
  categoryName: string;
  specs: boolean;
  sort: number;
  remark: string;
  orgId: string;
  status: boolean;
}