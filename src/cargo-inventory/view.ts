import * as moment from 'moment';
import { autoinject } from 'aurelia-dependency-injection';
import { CargoInventoryService } from '@app/cargo-inventory/services/cargo-inventory';
import { CargoInventoryVO, CargoInventory, CargoInventoryItem } from '@app/cargo-inventory/models/cargo-inventoty';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { addHeader, print } from '@app/common/services/print-tool';


@autoinject
export class View {

  dataSource: kendo.data.DataSource;
  cargoInventoryVO = {} as CargoInventoryVO;
  cargoInventory = {} as CargoInventory;
  inventoryItemList = new Array<CargoInventoryItem>();
  units = [] as DictionaryData[];

  constructor(private cargoInventoryService: CargoInventoryService,
              private dictionaryDataService: DictionaryDataService) {
    this.dataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.inventoryItemList);
        }
      }
    });
  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    if (params.id) {
      this.cargoInventoryVO = await this.cargoInventoryService.getCargoInventory(params.id);
      this.cargoInventory = this.cargoInventoryVO.cargoInventory;
      this.cargoInventory.startTimeStr = moment(this.cargoInventory.startTime).format('YYYY-MM-DD');
      this.cargoInventory.endTimeStr = moment(this.cargoInventory.endTime).format('YYYY-MM-DD');
      if (this.cargoInventory.inventoryCheckDate) {
        this.cargoInventory.inventoryCheckDateStr = moment(this.cargoInventory.inventoryCheckDate).format('YYYY-MM-DD');
      }
      if (this.cargoInventory.actualCheckDate) {
        this.cargoInventory.actualCheckDateStr = moment(this.cargoInventory.actualCheckDate).format('YYYY-MM-DD');
      }
      this.inventoryItemList = this.cargoInventoryVO.inventoryItemList;
      this.inventoryItemList.map(res => {
        if (res.instockDate) {
          res.instockDateStr = moment(res.instockDate).format('YYYY-MM-DD');
        }
        if (res.unit) {
          res.unitStr = this.units.find(d => d.dictDataCode == res.unit).dictDataName;
        }
        return res;
      });
      this.dataSource.read();
    }
  }

  printCargoItems() {
    let title = "货物盘点记录";
    let strHTML = $('#inventoryItems').html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true, 2);
  }

  printCargoInventory() {
    let title = "货物盘点库存清单";
    let strHTML = $('#inventoryDetail').html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true, 2);
  }
}