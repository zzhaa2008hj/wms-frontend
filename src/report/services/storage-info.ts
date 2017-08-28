import { RestClient, Query } from '@app/utils';
import { autoinject } from "aurelia-dependency-injection";
import { StorageInfoVo } from "@app/report/models/storage-info";
export interface Criteria {
  type?: number;
  warehouseId?: string;
  searchDate?: string;
}

@autoinject
export class StorageInfoService {
  constructor(private http: RestClient) {
  }

  page(criteria?: Criteria): Query<StorageInfoVo> {
    return this.http.query<StorageInfoVo>(`/report/storage-info/page`, criteria);
  }

  list(criteria?: Criteria): Promise<StorageInfoVo[]> {
    return this.http.createRequest('/report/storage-info/list')
      .withParams(criteria).asGet().send().then(res => res.content);
  }
}