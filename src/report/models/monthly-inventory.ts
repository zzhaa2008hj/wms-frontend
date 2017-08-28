export interface MonthlyInventory{
    type: number;

    customerName: string;

    batchNumber: string;

    cargoCategoryName: string;

    cargoName: string;

    month: string;

    lastMonthNumber: number;

    lastMonthQuantity: number;

    monthInstockNumber: number;

    monthInstockQuantity: number ;

    monthOutstockNumber: number;

    monthOutstockQuantity: number ;

    thisMonthNumber: number;

    thisMonthQuantity: number;

    unit: string;

    unitName: string;

    createTime: Date;
    
    createTimeStr: string;

    warehouseName: string;
}

export interface MonthlyInventoryVo{
    categoryLastMonthNumber: number;

    categoryLastMonthQuantity: number;

    categoryMonthInstockNumber: number;

    categoryMonthInstockQuantity: number;

    categoryMonthOutstockNumber: number;

    categoryMonthOutstockQuantity: number;

    categoryThisMonthNumber: number;

    categoryThisMonthQuantity: number;

    categoryMonthsInstockNumber: number;

    categoryMonthsInstockQuantity: number;

    categoryMonthsOutstockNumber: number;

    categoryMonthsOutstockQuantity: number;

    month: string;

    cargoCategoryName: string;

    list: MonthlyInventory[];
}

export interface MonthsInventoryVo{
    monthsInstockNumber: number;

    monthsInstockQuantity: number;

    monthsOutstockNumber: number;

    monthsOutstockQuantity: number;
}