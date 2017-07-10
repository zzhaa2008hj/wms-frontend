import { StorageInfo } from "@app/base/models/storage-info";
import { CargoItem } from "@app/base/models/cargo-info";
/**
 * 费收扣量
 */
export interface CargoDistrain {
    id: string;
    // 批次号
    batchNumber: string;
    // 货物明细表主键
    cargoItemId: string;
    // 扣押数量
    quantity: number;
    // 件数
    number: number;
    // 计量单位
    unit: string;
    // 启用禁用
    status: string;

    orgId: string;

    remark: string;
}

export interface CargoDistrainVo extends CargoDistrain {
    timestrap: number;

    cargoName: string;

    cargoCategoryName: string;

    cargoSubCatergoryName: string;
}

export interface CargoItemStorageInfoVo{
    cargoItem: CargoItem;
    storageInfo: StorageInfo;
}