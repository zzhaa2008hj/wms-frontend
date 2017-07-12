import { autoinject } from "aurelia-dependency-injection";
import { WorkStatisticsService } from "@app/instock/services/work-statistics";
import { DataSourceFactory } from "@app/utils";
import { ConstantValues } from '@app/common/models/constant-values';

@autoinject
export class ListWorkStatistics {
  searchName: string;
  dataSource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  categories: any[] = ConstantValues.BusinessTypes;

  constructor(private workStatisticsService: WorkStatisticsService,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.workStatisticsService.queryWorkStatisticses({ searchName: this.searchName }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }

  formatCategory(category: number) {
    return this.categories.find(res => res.type == category).name;
  }

}