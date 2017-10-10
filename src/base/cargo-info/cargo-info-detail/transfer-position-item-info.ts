import { observable } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";
import { PositionTransferItem } from "@app/cargo-position/models/transfer-info";
@customElement('transfer-position-item-info')
export class TransferPositionItemInfo {

  @bindable
  @observable
  cargoPositionTransferId: string;

  cargoItemDataSource: kendo.data.DataSource;
  cargoItems = [] as PositionTransferItem[];
  units = [] as DictionaryData[];

  constructor(private positionTransferInfoService: PositionTransferInfoService,
    private dictionaryDataService: DictionaryDataService) {
    this.cargoItemDataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.cargoItems);
        }
      }
    });
    this.initInfo();

  }

  async initInfo() {
    //单位
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.cargoItems = await this.positionTransferInfoService.getPositionTransferCargoItem(this.cargoPositionTransferId);
    this.cargoItems.map(item => {
      let unit = this.units.find(d => item.unit == d.dictDataCode);
      if (unit) item.unitName = unit.dictDataName;
    });
    console.log(this.cargoItems)
    this.cargoItemDataSource.read();
  }
}