import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { autoinject } from "aurelia-dependency-injection";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo } from "@app/base/models/cargo-info";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { ConstantValues } from "@app/common/models/constant-values";
import { CargoFlowSeparateService } from "@app/instock/services/cargo-flow-seperate";
/**
 * Created by Hui on 2017/6/30.
 */
@autoinject
export class Detail {
  beforeCargoInfo: CargoInfo;
  afterCargoInfo: CargoInfo;
  beforeCargoFlow: CargoFlow;
  afterCargoFlow: CargoFlow;
  instockStages: string[] = ConstantValues.InstockStages;
  dataSourceBefore = new kendo.data.HierarchicalDataSource({
    data: [],
    filter: { deleted: false }
  });
  dataSourceAfter = new kendo.data.HierarchicalDataSource({
    data: []
  });

  constructor(private cargoFlowService: CargoFlowService,
              private cargoFlowSeparateService: CargoFlowSeparateService,
              private cargoInfoService: CargoInfoService,
              private cargoItemService: CargoItemService,
              private vehicleService: InstockVehicleService) {
  }

  async activate(params) {
    let separate = await this.cargoFlowSeparateService.getCargoFlowSeparateById(params.id);

    this.beforeCargoFlow = await this.cargoFlowService.getCargoFlowByFlowNumber(separate.numberBeforeSeparate);
    this.beforeCargoInfo = await this.cargoInfoService.getCargoInfo(this.beforeCargoFlow.cargoInfoId);
    this.beforeCargoFlow.instockStageName = this.instockStages[this.beforeCargoFlow.stage + 1];
    let beforeCargoItems = await this.cargoItemService.getCargoItemsByFlowId(this.beforeCargoFlow.id);
    this.dataSourceBefore.data(beforeCargoItems);

    this.afterCargoFlow = await this.cargoFlowService.getCargoFlowByFlowNumber(separate.secondNumberAfterSeparate);
    this.afterCargoInfo = await this.cargoInfoService.getCargoInfo(this.afterCargoFlow.cargoInfoId);
    this.afterCargoFlow.instockStageName = this.instockStages[this.afterCargoFlow.stage + 1];
    let afterCargoItems = await this.cargoItemService.getCargoItemsByFlowId(this.afterCargoFlow.id);
    this.dataSourceAfter.data(afterCargoItems);
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