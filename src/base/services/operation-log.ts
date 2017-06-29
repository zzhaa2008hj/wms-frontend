import { autoinject } from 'aurelia-dependency-injection';
import { RestClient, Query, fixDate } from '@app/utils';
import { OperationLog } from '@app/base/models/operation-log';

@autoinject
export class OperationLogService {
  constructor(private http: RestClient) {
  }

  queryOperationLog(realName?: string): Query<OperationLog> {
    return this.http.query<OperationLog>(`/base/operationLog/page`, { realName })
      .map(log => fixDate(log, 'operationTime'));
  }
}