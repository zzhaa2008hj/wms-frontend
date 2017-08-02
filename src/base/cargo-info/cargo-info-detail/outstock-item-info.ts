import { observable } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { OrderItemService } from '@app/outstock/services/order';
import { OrderItem } from '@app/outstock/models/order';

@customElement('outstock-item-info')
export class OutItemInfo {

  @bindable
  @observable
  outstockOrderId: string;

  outstockOrderItemDataSource: kendo.data.DataSource;
  outstockOrderItems = [] as OrderItem[];
  units = [] as DictionaryData[];

  constructor(private orderItemService: OrderItemService,
    private dictionaryDataService: DictionaryDataService) {
    this.outstockOrderItemDataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.outstockOrderItems);
        }
      }
    });
    this.initInfo();

  }
  async initInfo() {
    //单位
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.outstockOrderItems = await this.orderItemService.getItemsByOrderIdAndType(this.outstockOrderId, 2);
    this.outstockOrderItems.map(item => {
      let unit = this.units.find(d => item.unit == d.dictDataCode);
      if (unit) {
        item.unit = unit.dictDataName;
      }
    });
    this.outstockOrderItemDataSource.read();
  }

  idChanged() {
    console.log('id changed', this.outstockOrderId);
  }

}