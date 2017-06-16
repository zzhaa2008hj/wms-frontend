import { Router } from "aurelia-router";
import { createDataSource, DataSourceFactory } from '../../utils';
import { autoinject } from "aurelia-dependency-injection";
import { DialogController, DialogService } from "ui";
import { OperationLogService } from '../services/operation-log';
import DataSource = kendo.data.DataSource;
@autoinject
export class OperationLog {

  realName: string = "";
  dataSource: DataSource;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private router: Router,
              private service: OperationLogService,
              private dialogService: DialogService,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.service.queryOperationLog(this.realName),
      pageSize: 10
    });
  }

  search() {
    return this.dataSource.read();
  }
}