import { autoinject } from "aurelia-dependency-injection";
import { RestClient } from "@app/utils";
import { StorageBudgetItem } from "@app/fee/models/storage-budget";
import { StorageInfo } from "@app/base/models/storage";
@autoinject
export class StorageBudgeService {
  constructor(private http: RestClient) {
  }

  async getStorageBudgetList(customerId: string, batchNumber: string,  endDate: string): Promise<StorageBudgetItem[]> {
    let res = await this.http.get(`/fee/storage-budget/item?customerId=${customerId}&chargeEndDate=${endDate}&batchNumber=${batchNumber}`);
    return res.content;
  }

  async getBatchNumbers(customerId: string): Promise<StorageInfo[]> {
    let res = await this.http.get(`/fee/storage-budget/getBatchNumber?customerId=${customerId}`);
    return res.content;
  }
}