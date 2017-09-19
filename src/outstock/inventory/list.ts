import { autoinject } from "aurelia-dependency-injection";
import { OutstockInventoryService } from "@app/outstock/services/inventory";
import { DataSourceFactory } from "@app/utils";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DictionaryData } from "@app/base/models/dictionary";

@autoinject
export class OutstockInventoryList {
  units = [] as DictionaryData[];
  batchNumber: string;
  dataSource: kendo.data.DataSource;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

   constructor(private outstockInventoryService: OutstockInventoryService,
               private dictionaryDataService: DictionaryDataService,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.outstockInventoryService.queryOutstockInventorys(this.batchNumber)
        .map(res => {
        if (res.unit) {
          res.unit = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
        }
        return res;
      }),
      pageSize: 10
    });
  }

  async activate() {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
  }

  select() {
    this.dataSource.read();
  }
}