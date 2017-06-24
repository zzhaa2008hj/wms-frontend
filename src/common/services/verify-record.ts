import { RestClient, Query, dateConverter, handleResult } from '../../utils';
import { autoinject } from 'aurelia-dependency-injection';
import { VerifyRecord } from '../models/verify-record';

export interface VerifyRecordCriteria {
  batchNumber?: string;
  category?: string;
  businessName?: string;
}

@autoinject
export class VerifyRecordService {
  constructor(private http: RestClient) {
  }

  queryVerifyRecord(criteria?: VerifyRecordCriteria): Query<VerifyRecord> {
    return this.http.query(`/base/verifyRecord/page`, criteria).map(dateConverter('operationTime'));
  }

  async addVerifyRecord(verifyRecord: VerifyRecord) {
    return this.http.post(`/base/verifyRecord`, verifyRecord).then(handleResult);
  }

  updateVerifyRecord(verifyRecord: VerifyRecord) {
    return this.http.put(`/base/verifyRecord/${verifyRecord.id}`, verifyRecord).then(handleResult);
  }
} 