export interface CustomerRate {
  id?: string;
  contractId: string;
  rateType: number;
  rateTypeStr: string;

  rateCategory: number;
  workId: string;
  workName: string;
  cargoCategoryId: string;
  cargoCategoryName: string;
  cargoSubCategoryName: string;
  pricingMode: number;
  unit: string;
  price: number;
  warehouseType: string;
  warehouseCategory: string;
  remark: string;
  orgId: string;
}