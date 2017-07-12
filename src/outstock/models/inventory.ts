/**
 * 出库清单
 */
export interface OutstockInventory {
    id: string;
    orgId: string;
    remark: string;
    // 货物信息表主键
    cargoInfoId: string;
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
    // 合计重量
    sumQuantity: number;
    // 合计件数
    sumNumber: number;
    // 计量单位
    unit: string;
}
/**
 * 出库清单明细
 */
export interface OutstockInventoryItem {
    id: string;
    orgId: string;
    remark: string;
    // 出库清单主键
    outstockInventoryId: string;
    // 货名
    cargoName: string;
    // 货类主键
    cargoCategoryId: string;
    // 货类
    cargoCategoryName: string;
    // 品牌
    cargoSubCategoryName: string;
    // 货物性质
    cargoType: number;
    // 库区名称
    warehouseName: string;
    // 司机
    driver: string;
    // 车牌号
    plateNumber: string;
    // 身份证号
    driverIdentityNumber: string;
    // 手机
    phoneNumber: string;
    // 提货日期
    outstockDate: Date;
    // 实出数量
    actualOutQuantity: number;
    // 实出件数
    actualOutNumber: number;
    // 计量单位
    unit: string;
}

export interface OutstockInventoryVo extends OutstockInventory{
    outstockInventoryItems: OutstockInventoryItem[];
}