import { autoinject } from "aurelia-dependency-injection";
import { OperationLogService } from '@app/base/services/operation-log';
import { DataSourceFactory } from '@app/utils';
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

  constructor(private service: OperationLogService,
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