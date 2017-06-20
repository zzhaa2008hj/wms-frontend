import { RestClient, Query, dateConverter } from '../../utils';
import { autoinject } from 'aurelia-dependency-injection';
import { OperationLog } from '../models/operation-log';

@autoinject
export class OperationLogService {
  constructor(private http: RestClient) {
  }

  queryOperationLog(realName?: string): Query<OperationLog> {
    return this.http.query(`/base/operationLog/page`, { realName }, { "x-eupwood-session-code": "" })
      .map(dateConverter('operationTime'));
  }
}