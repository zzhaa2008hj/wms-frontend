import { OutstockInventoryService } from '@app/outstock/services/inventory';
import { OutstockInventoryItem } from '@app/outstock/models/inventory';
import { OutstockInventoryVo } from '@app/outstock/models/inventory';
import { observable } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';

@customElement('outstock-item-info')
export class OutItemInfo {

  @bindable
  @observable
  outstockInventoryId: string;


  outstockInventoryVo: OutstockInventoryVo;
  outstockOrderItemDataSource: kendo.data.DataSource;
  outstockINbentoryItems = [] as OutstockInventoryItem[];
  units = [] as DictionaryData[];

  constructor(private outstockInventoryService: OutstockInventoryService,
    private dictionaryDataService: DictionaryDataService) {
    this.outstockOrderItemDataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.outstockINbentoryItems);
        }
      }
    });
    this.initInfo();

  }
  async initInfo() {
    //单位
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.outstockInventoryVo = await this.outstockInventoryService.getOutstockInventory(this.outstockInventoryId);
    this.outstockInventoryVo.outstockInventoryItems.map(item => {
      let unit = this.units.find(d => item.unit == d.dictDataCode);
      if (unit) {
        item.unit = unit.dictDataName;
      }
      item.outstockDate = new Date(item.outstockDate);
    });
    this.outstockINbentoryItems = this.outstockInventoryVo.outstockInventoryItems;
    this.outstockOrderItemDataSource.read();

  }

  idChanged() {
    console.log('id changed', this.outstockInventoryId);
  }

}