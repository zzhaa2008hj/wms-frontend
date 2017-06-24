import { autoinject } from 'aurelia-dependency-injection';
import { VerifyRecordService, VerifyRecordCriteria } from '@app/common/services/verify-record';
import { DataSourceFactory } from '@app/utils';
import DataSource = kendo.data.DataSource;

@autoinject
export class VerifyRecordList {
  
  dataSource: DataSource;

  constructor(private service: VerifyRecordService,
              private dataSourceFactory: DataSourceFactory) {
    
  } 

  activate(criteria: VerifyRecordCriteria) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.service.queryVerifyRecord(criteria),
      pageSize: 10
    });
  }
}