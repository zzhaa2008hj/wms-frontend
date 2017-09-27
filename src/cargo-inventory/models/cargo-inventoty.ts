import { BaseEntity } from '@app/common/models/base-entity';

export interface CargoInventory extends BaseEntity {

  demandFrom: number;
  demandFromStr: string;

  /**
   * 库区、货类、时间、客户
   */
  demandType: number;
  agentId: string;
  agentName: string;
  customerId: string;
  customerName: string;
  warehouseId: string;
  warehouseName: string;
  startTime: Date;
  endTime: Date;
  cargoCategoryId: string;
  cargoCategoryName: string;
  cargoSubCategoryName: string;
  status: number;
  statusStr: string;
  /**
   * 盘点人
   */
  inventoryChecker: string;
}

export interface CargoInventoryItem extends BaseEntity {
  cargoInventoryId: string;
  cargoName: string;
  cargoCategoryName: string;
  cargoSubCategoryName: string;
  warehouseName: string;

  inventoryNumber: number;
  inventoryQuantity: number;

  unit: string;
  unitStr: string;

  actualNumber: number;
  actualQuantity: number;

  profitLoss: number;
}

export interface CargoInventoryVO {
  cargoInventory: CargoInventory;
  inventoryItemList: Array<CargoInventoryItem>;
}