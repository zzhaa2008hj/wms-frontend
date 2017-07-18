import { autoinject } from "aurelia-dependency-injection";
import { WorkStatisticsService } from "@app/instock/services/work-statistics";
import { DataSourceFactory } from "@app/utils";
import { ConstantValues } from '@app/common/models/constant-values';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary'

@autoinject
export class ListWorkStatistics {
  searchName: string;
  dataSource: kendo.data.DataSource;

  units = [] as DictionaryData[];
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  categories: any[] = ConstantValues.BusinessTypes;

  constructor(private workStatisticsService: WorkStatisticsService,
              private dataSourceFactory: DataSourceFactory,
              private dictionaryDataService: DictionaryDataService) {
    
  }

  async activate(){
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.workStatisticsService.queryWorkStatisticses({ searchName: this.searchName })
      .map(res =>{
        if(res.unit){
          res.unit = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
        };
        return res;
      }),
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