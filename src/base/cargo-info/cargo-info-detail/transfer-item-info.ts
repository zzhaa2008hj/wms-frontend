import { observable } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { CargoownershipTransferItem } from '@app/cargo-ownership/models/cargo-ownership';
import { CargoownershipTransferService } from '@app/cargo-ownership/services/cargo-ownership';

@customElement('transfer-item-info')
export class TransferItemInfo {

  @bindable
  @observable
  cargoOwnershipTransferId: string;

  cargoItemDataSource: kendo.data.DataSource;
  cargoItems = [] as CargoownershipTransferItem[];
  units = [] as DictionaryData[];

  constructor(private cargoownershipTransferService: CargoownershipTransferService,
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

    this.cargoItems = await this.cargoownershipTransferService.getCargoItemsById(this.cargoOwnershipTransferId);
    this.cargoItems.map(item => {
      let unit = this.units.find(d => item.unit == d.dictDataCode);
      if (unit) item.unit = unit.dictDataName;
    });
    console.log(this.cargoItems)
    this.cargoItemDataSource.read();
  }
}