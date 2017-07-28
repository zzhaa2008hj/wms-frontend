/**
 * Created by shun on 2017/6/26.
 */
import { StorageInfoItem, StorageItemHistory, StorageInfo, StorageInfoVo } from "@app/base/models/storage";
import { StorageHistory } from "@app/base/models/storage-history";
import { Query, handleResult, RestClient, fixDate } from "@app/utils";
import { autoinject } from "aurelia-dependency-injection";

@autoinject
export class StorageService {
  constructor(private http: RestClient) {
  }

  /**
   * 查询库存信息
   */
  queryStoragePage(keywords?: string): Query<StorageInfoVo> {
    return this.http.query('/base/storage/page', { keywords });
  }

  /**
   * 查询库存明细
   * id 库存
   */
  queryStorageItemPage(id: string, warehouseId?: string): Query<StorageInfoItem> {
    return this.http.query<StorageInfoItem>(`/base/storage/${id}/item/page`, { warehouseId })
      .map(item => fixDate(item, 'instockDate'));
  }

  /**
   * 查询库存流水
   * batchNumber 批次号
   */
  queryStorageHistoryPage(searchParams: Object): Query<StorageHistory> {
    return this.http.query<StorageHistory>(`/base/storage/history/page`, searchParams).map(h => fixDate(h, 'date'));
  }

  /**
   * 保存库存明细
   */
  async saveItem(id: string, storageItem: StorageItemHistory): Promise<void> {
    await this.http.post(`/base/storage/${id}/item`, storageItem).then(handleResult);
  }

  /**
   * 获取单条库存信息
   */
  getStorageInfoById(id: string): Promise<StorageInfo> {
    return this.http.get(`/base/storage/${id}`).then(res => res.content);
  }

  async storageBalance(id: string): Promise<void> {
    await this.http.put(`/base/storage/${id}/balance`, null).then(handleResult);
  }
}