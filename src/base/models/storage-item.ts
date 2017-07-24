/**
 * Created by shun on 2017/6/26.
 * 库存明细表
 */
export interface StorageItem {
    id: string;
    // 库存信息表主键
    storageInfoId: string;
    // 库区主键
    warehouseId: string;
    // 库区名称
    warehouseName: string;
    // 集装箱号
    containerNumber: string;
    // 堆存数量
    storageQuantity: number;
    // 堆存件数
    storageNumber: number;
    // 计量单位
    unit: string;
    // 堆存坐标
    position: string;
    // 入库时间
    instockDate: Date;

    remark: string;

    orgId: string;

    unitName: string;
}

export interface StorageItemHistory extends StorageItem{
    // 类型  调整 or 抹平
    type: number;
    businessType: number;
}