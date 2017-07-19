import { Router } from "aurelia-router";
import { inject } from "aurelia-dependency-injection";
import { OutstockInventoryVo } from "@app/outstock/models/inventory";
import { OutstockInventoryService } from "@app/outstock/services/inventory";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';

export class OutstockInventoryView {
  outstockInventoryVo: OutstockInventoryVo;
  datasource: kendo.data.DataSource;
  units = [] as DictionaryData[];

  constructor( @inject private router: Router,
    @inject private outstockInventoryService: OutstockInventoryService,
    @inject private dictionaryDataService: DictionaryDataService) {
  }

  async activate({ id }) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.outstockInventoryVo = await this.outstockInventoryService.getOutstockInventory(id);
    this.outstockInventoryVo.outstockInventoryItems.map(item => {
      let unit = this.units.find(d => item.unit == d.dictDataCode);
      if (unit) {
        // 只是查看
        item.unit = unit.dictDataName;
      }
      item.outstockDate = new Date(item.outstockDate);
    });
    this.datasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.outstockInventoryVo.outstockInventoryItems);
        }
      },
      schema: {
        model: {
          id: 'id'
        }
      }
    });
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}
