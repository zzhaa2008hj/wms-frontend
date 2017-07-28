import { OrderItem } from '@app/instock/models/order-item';
import { InstockOrderVo } from '@app/instock/models/instock-order';
import { observable } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { DictionaryData } from '@app/base/models/dictionary';
import { InstockOrderService } from "@app/instock/services/instock-order";
import { DictionaryDataService } from '@app/base/services/dictionary';

@customElement('instock-item-info')
export class InstockItemInfo {

  @bindable
  @observable
  instockOrderId: string;

  instockOrderItemDataSource: kendo.data.DataSource;
  instockOrderVo: InstockOrderVo;
  instockOrderItems = [] as OrderItem[];
  units = [] as DictionaryData[];
  pageable = false;

  constructor(private instockOrderService: InstockOrderService,
    private dictionaryDataService: DictionaryDataService) {
    this.instockOrderItemDataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.instockOrderItems);
        }
      },
      schema: {
        model: {
          id: 'id'
        }
      }
    });
    this.initInfo();
  
  }
  async initInfo() {
    //单位
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.instockOrderVo = await this.instockOrderService.getInstockOrder(this.instockOrderId);
    this.instockOrderVo.orderItems.map(res => {
      let unit = this.units.find(d => res.unit == d.dictDataCode);
      if (unit) {
        res.unit = unit.dictDataName;
      }
    });
    this.instockOrderItems = this.instockOrderVo.orderItems;
    this.instockOrderItemDataSource.read();

  }

  idChanged() {
    console.log('id changed', this.instockOrderId);
  }

}