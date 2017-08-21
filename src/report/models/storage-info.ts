export interface StorageInfo {
  type: number;

  cargoCategoryId: string;

  cargoCategoryName: string;

  warehouseId: string;

  warehouseName: string;

  storageQuantity: number;

  storageNumber: number;

  makeDate: string;
}

export interface StorageInfoVo {
  id: string;

  warehouseId: string;

  warehouseName: string;

  storageQuantity: number;

  storageNumber: number;

  makeDate: string;

  list: StorageInfo[];
}