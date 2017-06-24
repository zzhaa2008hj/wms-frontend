import { autoinject } from 'aurelia-dependency-injection';
import { RestClient, Query, dateConverter } from '@app/utils';
import { OperationLog } from "src/base/models/operation-log";

@autoinject
export class OperationLogService {
  constructor(private http: RestClient) {
  }

  queryOperationLog(realName?: string): Query<OperationLog> {
    return this.http.query(`/base/operationLog/page`, { realName }).map(dateConverter('operationTime'));
  }
}