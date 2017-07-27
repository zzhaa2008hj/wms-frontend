/**
 * Created by shun on 2017/6/26.
 * 库存表
 */
export interface StorageInfo {
  id: string;
  // 货物明细表主键
  cargoItemId: string;
  // 代理商主键
  agentId: string;
  // 代理商名称
  agentName: string;
  // 客户主键
  customerId: string;
  // 客户名称
  customerName: string;
  // 批次号
  batchNumber: string;
  // 库存数量
  inventoryQuantity: number;
  // 库存件数
  inventoryNumber: number;
  // 计量单位
  unit: string;

  remark: string;

  orgId: string;

  unitName: string;
}

/**
 * Created by shun on 2017/6/26.
 * 库存明细表
 */
export interface StorageItem {
  id: string;
  // 库存信息表主键
  storageInfoId: string;
  // 库区主键
  warehouseId: string;
  // 库区名称
  warehouseName: string;
  // 集装箱号
  containerNumber: string;
  // 堆存数量
  storageQuantity: number;
  // 堆存件数
  storageNumber: number;
  // 计量单位
  unit: string;
  // 堆存坐标
  position: string;
  // 入库时间
  instockDate: Date;

  remark: string;

  orgId: string;

  unitName: string;

}

export interface StorageItemHistory extends StorageItem {
  // 类型  调整 or 抹平
  type: number;
  businessType: number;
}

export interface StorageInfoItem extends StorageItem {
  cargoItemId: string;
  // 代理商名称
  agentName: string;
  // 客户名称
  customerName: string;
  // 批次号
  batchNumber: string;

  cargoName: string;

  cargoCategoryName: string;

  cargoSubCatergoryName: string;
}

export interface StorageInfoVo extends StorageInfo {
  cargoName: string;
  cargoCategoryName: string;
  cargoSubCatergoryName: string;
}