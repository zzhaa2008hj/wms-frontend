export interface CargoInfoVo {
    cargoInfo: CargoInfo;
    cargoItems: CargoItem[];
}


/**
 *  客户货物信息
 */
export interface CargoInfo {
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
    warehouseType: string;

    /**˙
     * 内贸/保税
     */
    cargoType: string;

    /**
     * 散货/集装箱
     */
    cargoForm: string;

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

    // cargoItems: CargoItem[];
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

    freeDays: string;

    cargoRate: CargoRate[];

    // cargoRateSteps: CargoRateStep[];
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
    warehouseType: number;

    /**
     * 场、库
     */
    warehouseCategory: number;

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