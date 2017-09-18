import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { autoinject } from "aurelia-dependency-injection";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo } from "@app/base/models/cargo-info";
import { CargoFlow, InstockCargoItem } from "@app/instock/models/cargo-flow";
import { ConstantValues } from "@app/common/models/constant-values";
import * as moment from 'moment';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';

/**
 * Created by Hui on 2017/6/30.
 */
@autoinject
export class Details {
  cargoInfo: CargoInfo;
  cargoFlow: CargoFlow;
  instockStages: any[] = ConstantValues.InstockStages;
  units = [] as DictionaryData[];
  //warehouseTypes = [] as DictionaryData[];
  private cargoItems: InstockCargoItem[];

  constructor(private cargoFlowService: CargoFlowService,
              private cargoInfoService: CargoInfoService,
              private cargoItemService: CargoItemService,
              private dictionaryDataService: DictionaryDataService,
              private vehicleService: InstockVehicleService) {
  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    //this.warehouseTypes = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.cargoFlow = await this.cargoFlowService.getCargoFlowById(params.id);
    this.cargoFlow.instockDateStr = moment(this.cargoFlow.instockDate).format("YYYY-MM-DD");
    this.cargoInfo = await this.cargoInfoService.getCargoInfo(this.cargoFlow.cargoInfoId);
    // this.cargoInfo.warehouseTypeStr = this.warehouseTypes
    //   .find(res => res.dictDataCode == this.cargoInfo.warehouseType).dictDataName;
    this.cargoItems = await this.cargoItemService.getCargoItemsByFlowId(params.id);
    this.cargoItems.map(res => {
      res.unitStr = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
      return res;
    });
  }

  detailInit(e) {
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
            await this.vehicleService.listInstockVehicles(e.data.id)
              .then(options.success)
              .catch(err => options.errot("", "", err));
          }
        }
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

  onDataBound(e) {
    let grid = e.sender;
    grid.expandRow(grid.tbody.find('tr.k-master-row').first());
  }

}

