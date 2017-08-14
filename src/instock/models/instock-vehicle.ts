export interface InstockVehicle {
  id: string ;

  instockGoodsId: string ;

  plateNumber: string ;

  driverName: string ;

  driverIdentityNumber: string ;

  phoneNumber: string ;

  remark: string ;

  orgId: string ;

//唯一性标识
  sign?: string;

  cargoName: string;
}
