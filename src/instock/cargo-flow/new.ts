import { Router } from "aurelia-router";
import { DialogService, MessageDialogService } from "ui";
import { Container, inject } from 'aurelia-dependency-injection';
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { NewVehicle } from "@app/instock/cargo-flow/vehicle/new";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { RouterParams } from '@app/common/models/router-params';
import { CargoInfoService } from '@app/base/services/cargo-info';
import { CargoInfo } from '@app/base/models/cargo-info';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { CodeService } from '@app/common/services/code';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';

/**
 * Created by Hui on 2017/6/23.
 */
export class NewCargoFlow {
  cargoItems = [];
  units = [] as DictionaryData[];
  cargoFlow = {} as CargoFlow;
  selectedCargoInfo: any;
  hasInfoId: boolean = false;
  baseCargoInfo: Array<CargoInfo>;

  dataSourceCargoItem = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.cargoItems);
      },
      update: (options) => {
        options.success();
      },
      create: (options) => {
        options.success();
      },
      destroy: (options) => {
        options.success();
      }
    },
  });
  vehicle = [];
  dataSourceVehicle = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.vehicle);
      },
      update: (options) => {
        options.success();
      },
      create: (options) => {
        options.success();
      },
      destroy: (options) => {
        options.success();
      }
    }
  });

  validationController: ValidationController;
  private dropDownListCargoItem: any;

  constructor(@inject private router: Router,
              @inject private cargoFlowService: CargoFlowService,
              @inject private dialogService: DialogService,
              @inject private cargoInfoService: CargoInfoService,
              @inject private messageDialogService: MessageDialogService,
              @inject private codeService: CodeService,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject('routerParams') private routerParams: RouterParams,
              validationControllerFactory: ValidationControllerFactory, container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate() {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.baseCargoInfo = await this.cargoInfoService.listBaseCargoInfos({finished: 0});
    if (this.routerParams.infoId) {
      this.hasInfoId = true;
      let cargoInfo: CargoInfo = await this.cargoInfoService.getCargoInfo(this.routerParams.infoId);
      let res = await this.codeService.generateCode("2", cargoInfo.batchNumber);
      this.cargoFlow.instockFlowNumber = res.content;
      this.setCargoFlowInfo(cargoInfo);
      this.getBaseCargoItems();
    }
  }

  async onSelectCargoInfo(e) {
    let dataItem: CargoInfo = this.selectedCargoInfo.dataItem(e.item);
    let res = await this.codeService.generateCode("2", dataItem.batchNumber);
    this.cargoFlow.instockFlowNumber = res.content;
    this.setCargoFlowInfo(dataItem);
    this.getBaseCargoItems();
  }

  setCargoFlowInfo(dataItem: CargoInfo) {
    this.cargoFlow.agentId = dataItem.agentId;
    this.cargoFlow.agentName = dataItem.agentName;
    this.cargoFlow.customerId = dataItem.customerId;
    this.cargoFlow.customerName = dataItem.customerName;
    this.cargoFlow.batchNumber = dataItem.batchNumber;
    this.cargoFlow.unit = dataItem.unit;
    this.cargoFlow.cargoInfoId = dataItem.id;
    this.cargoFlow.id = null;
    this.cargoFlow.lastBatch = 0;
  }

  async getBaseCargoItems() {
    let res = await this.cargoFlowService.listBaseCargoItems(this.cargoFlow.cargoInfoId);
    Object.assign(this.cargoItems, res);
    this.cargoItems.forEach(ci => {
      let r = [0, 1, 2, 3].sort(() => Math.random() - 0.5).toString();
      Object.assign(ci, { sign: r });
      ci.cargoItemId = ci.id;
      ci.id = null;
    });
    this.cargoItems.map(res => {
      res.unitStr = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
      return res;
    });
    this.dataSourceCargoItem.read();
  }

  async addVehicle(cargoItem) {
    let result = await this.dialogService.open({
      viewModel: NewVehicle,
      model: cargoItem,
      lock: true
    }).whenClosed();
    if (result.wasCancelled) return;
    if (result.output) {
      this.vehicle.push(result.output);
      this.dataSourceVehicle.read();
    }
  }

  onSelect(e) {
    let dataItem = this.dropDownListCargoItem.dataItem(e.item);
    console.log(dataItem);
    this.cargoItems.splice(0, 0, dataItem);
    this.dataSourceCargoItem.data(this.cargoItems);
  }

  deleteCargoItem(e) {
    this.cargoItems.forEach(ci => {
      if (e.sign == ci.sign) {
        let index = this.cargoItems.indexOf(ci);
        this.cargoItems.splice(index, 1);
        //同时删除车辆信息
        this.vehicle.forEach(v => {
          if (v.sign == ci.sign) {
            this.deleteVehicle(v);
          }
        });
      }
    });
    this.dataSourceCargoItem.data(this.cargoItems);
    this.dataSourceVehicle.data(this.vehicle);
  }

  deleteVehicle(e) {
    this.vehicle.forEach(v => {
      if (e.sign == v.sign) {
        let index = this.vehicle.indexOf(v);
        this.vehicle.splice(index, 1);
      }
    });
    this.dataSourceVehicle.read();
  }

  async addNewCargoFlow() {
    let vehicles = [];
    Object.assign(vehicles, this.dataSourceVehicle.data());
    let cargoItems = [];
    Object.assign(cargoItems, this.dataSourceCargoItem.data());
    if (vehicles || cargoItems) {
      let orderQuantity = 0;
      let orderNumber = 0;
      cargoItems.forEach(ci => {
        orderQuantity += ci.orderQuantity;
        orderNumber += ci.orderNumber;
        let vs = [];
        vehicles.forEach(v => {
          if (ci.sign == v.sign) {
            vs.push(v);
          }
        });
        Object.assign(ci, { vehicles: vs });
      });
      this.cargoFlow.orderQuantity = orderQuantity;
      this.cargoFlow.orderNumber = orderNumber;
      Object.assign(this.cargoFlow, { cargoItems: cargoItems });
    }

    this.validationController.addObject(this.cargoFlow, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    try {
      await this.cargoFlowService.saveCargoFlow(this.cargoFlow);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await
        this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
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