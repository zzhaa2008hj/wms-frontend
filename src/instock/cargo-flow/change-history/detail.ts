import { autoinject } from "aurelia-dependency-injection";
import { CargoFlow, InstockCargoItem } from '@app/instock/models/cargo-flow';
import { DialogController } from 'ui';
import { ChangeHistory } from '@app/common/models/change-history';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import * as moment from 'moment';
import { InstockVehicle } from '@app/instock/models/instock-vehicle';

@autoinject
export class CargoFlowChangeHistoryDetail {

  oldCargoFlow: CargoFlow;
  newCargoFlow: CargoFlow;
  units = [] as DictionaryData[];
  warehouseTypes = [] as DictionaryData[];
  oldCargoItems: InstockCargoItem[];
  newCargoItems: InstockCargoItem[];
  oldVehicles: InstockVehicle[];
  newVehicles: InstockVehicle[];

  constructor(private dialogController: DialogController,
              private dictionaryDataService: DictionaryDataService) {
  }

  async activate(changeHistory: ChangeHistory<CargoFlow>) {

    this.oldCargoFlow = changeHistory.oldObj;
    this.newCargoFlow = changeHistory.newObj;

    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.warehouseTypes = await this.dictionaryDataService.getDictionaryDatas("warehouseType");

    this.oldCargoFlow.instockDateStr = moment(this.oldCargoFlow.instockDate).format("YYYY-MM-DD");
    this.oldCargoItems = this.oldCargoFlow.cargoItems;
    this.oldCargoItems.map(res => {
      res.unitStr = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
      return res;
    });

    this.newCargoFlow.instockDateStr = moment(this.newCargoFlow.instockDate).format("YYYY-MM-DD");
    this.newCargoItems = this.newCargoFlow.cargoItems;
    this.newCargoItems.map(res => {
      res.unitStr = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
      return res;
    });
  }

  oldDetailInit(e) {
    let detailRow = e.detailRow;
    detailRow.find('.tabstrip').kendoTabStrip({
      animation: {
        open: { effects: 'fadeIn' }
      }
    });

    detailRow.find('.orders').kendoGrid({
      dataSource: {
        transport: {
          read: async options => {
            options.success(e.data.vehicles);
          }
        },
        filter: { field: 'instockGoodsId', operator: 'eq', value: e.data.id }
      },
      scrollable: false,
      sortable: true,
      columns: [
        { field: 'plateNumber', title: '车牌号' },
        { field: 'driverName', title: '司机名称' },
        { field: 'driverIdentityNumber', title: '身份证号' },
        { field: 'phoneNumber', title: '电话' },
        { field: 'remark', title: '备注' },
      ]
    });
  }

  newDetailInit(e) {
    let detailRow = e.detailRow;
    detailRow.find('.tabstrip').kendoTabStrip({
      animation: {
        open: { effects: 'fadeIn' }
      }
    });

    detailRow.find('.orders').kendoGrid({
      dataSource: {
        transport: {
          read: async options => {
            options.success(e.data.vehicles);
          }
        },
        filter: { field: 'instockGoodsId', operator: 'eq', value: e.data.id }
      },
      scrollable: false,
      sortable: true,
      columns: [
        { field: 'plateNumber', title: '车牌号' },
        { field: 'driverName', title: '司机名称' },
        { field: 'driverIdentityNumber', title: '身份证号' },
        { field: 'phoneNumber', title: '电话' },
        { field: 'remark', title: '备注' },
      ]
    });
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}