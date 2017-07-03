import { inject } from "aurelia-dependency-injection";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
import { DialogController } from "ui";
import { InstockVehicle } from "@app/instock/models/instock-vehicle";
import { WorkOrder } from "@app/instock/models/work";
import { Subscription } from "aurelia-event-aggregator";
import { BindingEngine } from "aurelia-framework";

export class NewWorkOrder {
  selectedVehicle: any;
  instockVehicle = {} as InstockVehicle;
  goodsId: string;
  workOrder = {} as WorkOrder;

  cargoItemsSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.cargoItemService.getCargoItemsByFlowId(this.cargoFlow.id)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  instockVehicleSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.instockVehicleService.listInstockVehicles(this.goodsId)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  private subscription: Subscription;
  constructor(@inject('cargoFlow') private cargoFlow: CargoFlow,
              @inject private cargoItemService: CargoItemService,
              @inject private bindingEngine: BindingEngine,
              @inject private instockVehicleService: InstockVehicleService,
              @inject private dialogController: DialogController) {
    console.log("0000000000000000000");
    console.log(this.cargoFlow);
  }

  bind() {
    this.subscription = this.bindingEngine.expressionObserver(this, 'workOrder.businessId')
      .subscribe(async () => {
        if (this.workOrder.id) {
          this.goodsId = this.workOrder.id;
          this.instockVehicleSource.read();
        } else {
          this.instockVehicleSource.data([]);
        }
      });
  }

  unbind() {
    this.subscription.dispose();
  }

  onSelectCargoItem(e) {
    this.instockVehicle = this.selectedVehicle.dataItem(e.item);
    this.workOrder.plateNumber = this.instockVehicle.plateNumber;
    this.workOrder.driverName = this.instockVehicle.driverName;
    this.workOrder.driverIdentityNumber = this.instockVehicle.driverIdentityNumber;
    this.workOrder.phoneNumber = this.instockVehicle.phoneNumber;
  }

  async cancel() {
    await this.dialogController.cancel();
  }

  async save() {
    await this.dialogController.ok(this.workOrder);
  }
}