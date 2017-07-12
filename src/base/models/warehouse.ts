/**
 * Created by Hui on 2017/6/15.
 */
export interface Warehouse {
  id?: string;
  parentId?: string;
  category: string;
  name: string;
  type: string;
  remark: string;
  orgId: string;
  status: boolean;

  //列表页显示
  typeStr: string;
  categoryStr: string;
}