import { observable } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { OrderItemService } from '@app/outstock/services/order';
import { OrderItem } from '@app/outstock/models/order';
import { PositionTransferItem } from "@app/cargo-position/models/transfer-info";
import { PositionTransferItemService } from "@app/cargo-position/services/transfer-info";

@customElement('position-item-info')
export class OutItemInfo {

  @bindable
  @observable
  positionOrderId: string;

  positionOrderItemDataSource: kendo.data.DataSource;
  positionOrderItems = [] as PositionTransferItem[];
  units = [] as DictionaryData[];

  constructor(private positionTransferItemService: PositionTransferItemService,
    private dictionaryDataService: DictionaryDataService) {
    this.positionOrderItemDataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.positionOrderItems);
        }
      }
    });
    this.initInfo();
  }

  async initInfo() {
    //单位
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.positionOrderItems = await this.positionTransferItemService.getItems(this.positionOrderId);
    this.positionOrderItems.map(item => {
      let unit = this.units.find(d => item.unit == d.dictDataCode);
      if (unit) {
        item.unit = unit.dictDataName;
      }
    });
    this.positionOrderItemDataSource.read();
  }

  idChanged() {
    console.log('id changed', this.positionOrderId);
  }

}