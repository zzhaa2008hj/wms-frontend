/**
 * Created by shun on 2017/6/26.
 * 库存流水表
 */
export interface StorageHistory {
    id: string;
    // 库存明细表主键
    storageItemId: string;
    // 批次号
    batchNumber: string;
    // 类型
    type: number;
    // 业务名称
    businessName: string;
    // 数量
    quantity: number;
    // 件数
    number: number;
    // 计量单位
    unit: string;
    // 时间
    date: Date;

    remark: string;

    orgId: string;
}