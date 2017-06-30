/**
 * Created by Hui on 2017/6/15.
 */
export interface Warehouse {
  id?: string;
  parentId?: string;
  category: number;
  name: string;
  type: number;
  remark: string;
  orgId: string;
  status: boolean;
}