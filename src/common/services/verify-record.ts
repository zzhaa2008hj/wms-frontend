import { autoinject } from 'aurelia-dependency-injection';
import { VerifyRecord } from '@app/common/models/verify-record';
import { RestClient, Query, handleResult, fixDate } from '@app/utils';

export interface VerifyRecordCriteria {
  batchNumber?: string;
  category?: string;
  businessName?: string;
  businessId?: string;
  businessType?: number;
}

@autoinject
export class VerifyRecordService {
  constructor(private http: RestClient) {
  }

  queryVerifyRecord(criteria?: VerifyRecordCriteria): Query<VerifyRecord> {
    return this.http.query<VerifyRecord>(`/base/verifyRecord/page`, criteria)
      .map(record => fixDate(record, 'applyTime', 'verifyTime'));
  }

  addVerifyRecord(verifyRecord: VerifyRecord): Promise<void> {
    return this.http.post(`/base/verifyRecord`, verifyRecord).then(handleResult);
  }

  updateVerifyRecord(verifyRecord: VerifyRecord): Promise<void> {
    return this.http.put(`/base/verifyRecord/${verifyRecord.id}`, verifyRecord).then(handleResult);
  }

  getVerifyRecord(id: string): Promise<VerifyRecord> {
    return this.http.get(`/base/verifyRecord/${id}`).then(res => res.content);
  }
} 