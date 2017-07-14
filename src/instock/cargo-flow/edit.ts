import { Router } from "aurelia-router";
import { DialogService, MessageDialogService } from "ui";
import { autoinject, Container } from "aurelia-dependency-injection";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { NewVehicle } from "@app/instock/cargo-flow/vehicle/new";
import { CargoFlow, InstockCargoItem } from "@app/instock/models/cargo-flow";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { CargoInfoService } from '@app/base/services/cargo-info';

/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class EditCargoFlow {
  cargoItems = [] as InstockCargoItem[];
  deletedCargoItems = [];
  cargoFlow = {} as CargoFlow;
  selectedCargoInfo: any;
  units = [] as DictionaryData[];
  baseCargoInfo = {
    transport: {
      read: async options => {
        await this.cargoInfoService.listBaseCargoInfos()
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  };
  dataSourceCargoItem = new kendo.data.HierarchicalDataSource({
    data: []
  });
  dataSourceDeletedCargoItem = new kendo.data.HierarchicalDataSource({
    data: []
  });
  vehicles = [];
  dataSourceVehicle = new kendo.data.HierarchicalDataSource({
    data: []
  });

  validationController: ValidationController;
  private dropDownListCargoItem: any;

  constructor(private router: Router,
              private cargoInfoService: CargoInfoService,
              private cargoFlowService: CargoFlowService,
              private cargoItemService: CargoItemService,
              private vehicleService: InstockVehicleService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService,
              private dictionaryDataService: DictionaryDataService,
              validationControllerFactory: ValidationControllerFactory, container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.cargoFlow = await this.cargoFlowService.getCargoFlowById(params.id);
    this.cargoItems = await this.cargoItemService.getCargoItemsByFlowId(params.id);
    let baseCargoItems = await this.cargoFlowService.listBaseCargoItems(this.cargoFlow.cargoInfoId);
    if (this.cargoItems) {
      for (let ci of this.cargoItems) {
        ci.unitStr = this.units.find(r => r.dictDataCode == ci.unit).dictDataName;
        let vehicles = await this.vehicleService.listInstockVehicles(ci.id);
        vehicles.forEach(v => {
          Object.assign(v, { cargoName: ci.cargoName });
          this.vehicles.push(v);
        });
        baseCargoItems.forEach(bci => {
          if (bci.id == ci.cargoItemId) {
            let index = baseCargoItems.indexOf(bci);
            baseCargoItems.splice(index, 1);
            return;
          }
        });
      }
      this.deletedCargoItems = baseCargoItems;
    }
    
    this.dataSourceCargoItem.data(this.cargoItems);
    this.dataSourceVehicle.data(this.vehicles);
    this.dataSourceDeletedCargoItem.data(this.deletedCargoItems);
  }

  async addVehicle(cargoItem) {
    let result = await this.dialogService.open({
      viewModel: NewVehicle,
      model: cargoItem,
      lock: true
    }).whenClosed();
    if (result.wasCancelled) return;
    if (result.output) {
      this.vehicles.push(result.output);
      this.dataSourceVehicle.data(this.vehicles);
    }
  }

  deleteCargoItem(e) {
    this.cargoItems.forEach(ci => {
      if (e.id == ci.id) {
        let index = this.cargoItems.indexOf(ci);
        let dci = this.cargoItems.splice(index, 1);
        this.deletedCargoItems.push(dci[0]);
        //同时删除车辆信息
        this.vehicles.forEach(v => {
          if (v.instockGoodsId == ci.id) {
            this.deleteVehicle(v);
          }
        });
      }
    });
    this.dataSourceCargoItem.data(this.cargoItems);
    this.dataSourceVehicle.data(this.vehicles);
    this.dataSourceDeletedCargoItem.data(this.deletedCargoItems);
  }

  onSelect(e) {
    let dataItem = this.dropDownListCargoItem.dataItem(e.item);
    console.log(dataItem);
    this.cargoItems.splice(0, 0, dataItem);
    let index = this.dataSourceCargoItem.indexOf(e);
    this.deletedCargoItems.splice(index, 1);
    this.dataSourceCargoItem.data(this.cargoItems);
    this.dataSourceDeletedCargoItem.data(this.deletedCargoItems);
  }

  deleteVehicle(e) {
    this.vehicles.forEach(v => {
      if (e.id == v.id) {
        let index = this.vehicles.indexOf(v);
        this.vehicles.splice(index, 1);
      }
    });
    this.dataSourceVehicle.data(this.vehicles);
  }

  async updateCargoFlow() {
    let vehicles = [];
    Object.assign(vehicles, this.dataSourceVehicle.data());
    let cargoItems = [];
    Object.assign(cargoItems, this.dataSourceCargoItem.data());
    let orderQuantity = 0;
    let orderNumber = 0;
    if (vehicles || cargoItems) {
      cargoItems.forEach(ci => {
        orderQuantity += ci.orderQuantity;
        orderNumber += ci.orderNumber;
        let vs = [];
        vehicles.forEach(v => {
          if (ci.id == v.instockGoodsId) {
            vs.push(v);
          }
        });
        Object.assign(ci, { vehicles: vs });
      });
      Object.assign(this.cargoFlow, { cargoItems: cargoItems });
    }
    this.cargoFlow.orderQuantity = orderQuantity;
    this.cargoFlow.orderNumber = orderNumber;

    this.validationController.addObject(this.cargoFlow, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    try {
      await this.cargoFlowService.updateCargoFlow(this.cargoFlow);
      await this.messageDialogService.alert({ title: "修改成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await
        this.messageDialogService.alert({ title: "修改失败", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}

const validationRules = ValidationRules
  .ensure((cargoFlow: CargoFlow) => cargoFlow.contactPerson)
  .displayName('联系人')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((cargoFlow: CargoFlow) => cargoFlow.contactNumber)
  .displayName('联系电话')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies(x => /^[1][358][0-9]{9}$/.test(x)).withMessage(` 请输入正确的11位手机号码 e.g.139 0000 0000`)

  .ensure((cargoFlow: CargoFlow) => cargoFlow.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;