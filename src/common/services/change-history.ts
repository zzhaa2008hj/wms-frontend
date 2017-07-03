import { autoinject } from 'aurelia-dependency-injection';
import { RestClient, Query, fixDate } from '@app/utils';
import { ChangeHistory } from '@app/common/models/change-history';

@autoinject
export class ChangeHistoryService {
  constructor(private http: RestClient) {
  }

  queryChangeHistory(businessId: string): Query<ChangeHistory<any>> {
    return this.http.query<ChangeHistory<any>>(`/base/recordHistory/${businessId}/page`)
      .map(res => fixDate(res, 'createTime'));
  }
} 