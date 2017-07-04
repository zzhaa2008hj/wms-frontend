import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { autoinject } from "aurelia-dependency-injection";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo } from "@app/base/models/cargo-info";
import { CargoFlow, InstockCargoItem } from "@app/instock/models/cargo-flow";
import { ConstantValues } from "@app/common/models/constant-values";
/**
 * Created by Hui on 2017/6/30.
 */
@autoinject
export class Details {
  cargoInfo: CargoInfo;
  cargoFlow: CargoFlow;
  instockStages: string[] = ConstantValues.InstockStages;
  private cargoItems: InstockCargoItem[];

  constructor(private cargoFlowService: CargoFlowService,
              private cargoInfoService: CargoInfoService,
              private cargoItemService: CargoItemService,
              private vehicleService: InstockVehicleService) {
  }

  async activate(params) {
    this.cargoFlow = await this.cargoFlowService.getCargoFlowById(params.id);
    this.cargoInfo = await this.cargoInfoService.getCargoInfo(this.cargoFlow.cargoInfoId);
    this.cargoFlow.instockStageName = this.instockStages[this.cargoFlow.stage + 1];
    this.cargoItems = await this.cargoItemService.getCargoItemsByFlowId(params.id);
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