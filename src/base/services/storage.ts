/**
 * Created by shun on 2017/6/26.
 */
import {StorageInfo} from "@app/base/models/storage-info";
import {StorageItem, StorageItemHistory} from "@app/base/models/storage-item";
import {StorageHistory} from "@app/base/models/storage-history";
import {Query, handleResult, RestClient, fixDate} from "@app/utils";
import {autoinject} from "aurelia-dependency-injection";

@autoinject
export class StorageService {
  constructor(private http: RestClient) {
  }

  /**
   * 查询库存信息
   */
  queryStoragePage(keywords?: string): Query<StorageInfo> {
    return this.http.query('/base/storage/page', {keywords});
  }

  /**
   * 查询库存明细
   * id 库存
   */
  queryStorageItemPage(id: string, keywords?: string): Query<StorageItem> {
    return this.http.query<StorageItem>(`/base/storage/${id}/item/page`, {keywords})
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
}