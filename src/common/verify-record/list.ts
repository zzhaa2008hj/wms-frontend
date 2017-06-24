import { VerifyRecord } from '../models/verify-record';
import { autoinject } from 'aurelia-dependency-injection';
import { VerifyRecordService, VerifyRecordCriteria } from '../services/verify-record';
import { DataSourceFactory } from '../../utils';
import { DialogService } from 'ui';
import DataSource = kendo.data.DataSource;

@autoinject
export class VerifyRecordList {
  
  dataSource: DataSource;

  constructor(private service: VerifyRecordService,
              private dialogService: DialogService,
              private dataSourceFactory: DataSourceFactory) {
    
  } 

  activate(criteria: VerifyRecordCriteria) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.service.queryVerifyRecord(criteria),
      pageSize: 10
    });
  }
}