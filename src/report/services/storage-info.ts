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
}