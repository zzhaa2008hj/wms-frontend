/**
 *  客户货物信息
 */
export interface CargoInfo {
    cargoFlowSize: number;

    id: string;

    batchNumber: string;

    billLadingNumber: string;

    contractId: string;

    contractNumber: string;

    agentId: string;

    agentName: string;

    customerId: string;

    customerName: string;

    /**
     * 公共/承包
     */
    warehouseType: number;

    /**˙
     * 内贸/保税
     */
    cargoType: number;

    /**
     * 散货/集装箱
     */
    cargoForm: number;

    unit: string;

    orderQuantity: number;

    orderNumber: number;

    instockQuantity: number;

    instockNumber: number;

    outstockQuantity: number;

    outstockNumber: number;

    instockStatus: number;

    outstockStatus: number;

    finished: number;

    remark: string;
    
    cargoItems: CargoItem[];
}

/**
 * 货物明细
 */
export interface CargoItem {
    id: string;

    cargoInfoId: string;

    batchNumber: string;

    cargoName: string;

    cargoCategoryId: string;

    cargoCategoryName: string;

    cargoSubCatergoryName: string;

    orderQuantity: number;

    orderNumber: number;

    unit: string;

    freeDays: number;

    cargoRates: CargoRate[];

    remark: string;
}

/**
 * 货物费率
 */
export interface CargoRate {
    id: string;

    batchNumber: string;

    cargoItemId: string;

    rateType: number;

    rateCategory: number;

    workId: string;

    workName: string;

    cargoCategoryId: string;

    cargoCategoryName: string;

    cargoSubCategoryName: string;

    pricingMode: number;

    unit: string;

    price: number;

    actualPrice: number;

    /**
     * 内贸、保税、承包内贸、承包保税
     */
    warehouseType: string;

    /**
     * 场、库
     */
    warehouseCategory: string;

    cargoRateSteps: CargoRateStep[];
}

/**
 * 货物阶梯费率
 */
export interface CargoRateStep {
    id: string;

    cargoRateId: String;

    stepNum: number;

    stepStart: number;

    stepEnd: number;

    stepPrice: number;

    stepUnit: string;
}