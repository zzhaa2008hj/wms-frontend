export interface CargoInfo {
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


}