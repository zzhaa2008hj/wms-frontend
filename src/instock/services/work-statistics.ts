import { autoinject } from "aurelia-dependency-injection";
import { Query, RestClient } from "@app/utils";
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
    return this.http.query(`instock/warehouseWorkOrderStatistics/page`, criterira);
  }

  getWorkStatisticsById(id: string): Promise<WorkStatistics> {
    return this.http.get(`instock/warehouseWorkOrderStatistics/${id}`).then(res => res.content);
  }
}
