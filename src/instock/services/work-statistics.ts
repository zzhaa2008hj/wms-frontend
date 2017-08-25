import { autoinject } from "aurelia-dependency-injection";
import { handleResult, Query, RestClient } from "@app/utils";
import { WorkStatistics } from "@app/instock/models/work";
/**
 * 查询条件
 */
export interface WorkStatisticsCriteria {
  searchName?: string;
  batchNumber?: string;
}

@autoinject
export class WorkStatisticsService {
  constructor(private http: RestClient) {
  }

  queryWorkStatisticses(criterira: WorkStatisticsCriteria): Query<WorkStatistics> {
    return this.http.query(`/base/warehouseWorkOrderStatistics/page`, criterira);
  }

  getWorkStatisticsById(id: string): Promise<WorkStatistics> {
    return this.http.get(`/base/warehouseWorkOrderStatistics/${id}`).then(res => res.content);
  }

  getStatistics(flowId: string): Promise<WorkStatistics> {
    return this.http.get(`/base/warehouseWorkOrderStatistics/get/${flowId}`).then(res => res.content);
  }

  getOutstockStatistics(outstockOrderId: string): Promise<WorkStatistics>{
    return this.http.get(`/base/warehouseWorkOrderStatistics/outstockStatistics/${outstockOrderId}`)
      .then(res => res.content);
  }

  saveStatistics(workStatistics: WorkStatistics): Promise<void> {
    return this.http.post(`/base/warehouseWorkOrderStatistics/statistics`, workStatistics).then(handleResult);
  }
}
