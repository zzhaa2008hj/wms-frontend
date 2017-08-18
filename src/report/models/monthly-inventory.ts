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
}