/**
 * Created by shun on 2017/6/26.
 * 库存表
 */
export interface StorageInfo {
    id: string;
    // 货物明细表主键
    cargoItemId: string;
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
    // 库存数量
    inventoryQuantity: number;
    // 库存件数
    inventoryNumber: number;
    // 计量单位
    unit: string;

    remark: string;

    orgId: string;

    unitName: string;
}