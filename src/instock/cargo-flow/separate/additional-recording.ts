import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { autoinject, Container } from "aurelia-dependency-injection";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
import { CargoInfo } from "@app/base/models/cargo-info";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { ConstantValues } from "@app/common/models/constant-values";
import { Router } from "aurelia-router";
import { CargoFlowSeparateService } from "@app/instock/services/cargo-flow-seperate";
import { MessageDialogService } from "ui";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { observable } from 'aurelia-framework';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { CodeService } from '@app/common/services/code';

@autoinject
export class AdditionalRecordingSeparate {
  @observable disabled: boolean = false;
  cargoInfo: CargoInfo;
  cargoFlow: CargoFlow;
  cargoItems = [];
  units = [] as DictionaryData[];
  instockStages: any[] = ConstantValues.InstockStages;
  dataSourceCargoItem = new kendo.data.HierarchicalDataSource({
    data: []
  });
  dataSourceSeparateCargoItem = new kendo.data.HierarchicalDataSource({
    data: []
  });
  vehicles = [];
  dataSourceVehicle = new kendo.data.HierarchicalDataSource({
    data: []
  });
  dataSourceSeparateVehicle = new kendo.data.HierarchicalDataSource({
    data: []
  });
  validationController: ValidationController;
  beforeSeparateInstockFlowNumber: string;
  cargoFlowDatePicker: kendo.ui.DatePicker;
  maxDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

  constructor(private cargoFlowService: CargoFlowService,
    private router: Router,
    private cargoFlowSeparateService: CargoFlowSeparateService,
    private messageDialogService: MessageDialogService,
    private cargoItemService: CargoItemService,
    private vehicleService: InstockVehicleService,
    private dictionaryDataService: DictionaryDataService,
    private codeService: CodeService,
    validationControllerFactory: ValidationControllerFactory,
    container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.cargoFlow = await this.cargoFlowService.getCargoFlowById(params.id);
    this.beforeSeparateInstockFlowNumber = this.cargoFlow.instockFlowNumber;
    this.cargoFlow.instockFlowNumber = "";
    //this.cargoFlow.instockStageName = this.instockStages[this.cargoFlow.stage + 1];
    let cargoItems = await this.cargoItemService.getCargoItemsByFlowId(params.id);
    if (cargoItems) {
      for (let ci of cargoItems) {
        if (ci.unit) {
          ci.unitStr = this.units.find(d => d.dictDataCode == ci.unit).dictDataName;
        }
        let cargoItem = await this.cargoItemService.getBaseCargoItemById(ci.cargoItemId);
        Object.assign(ci, { cargoSubCatergoryName: cargoItem.cargoSubCatergoryName, freeDays: cargoItem.freeDays });
        let vehicles = await this.vehicleService.listInstockVehicles(ci.id);
        vehicles.forEach(v => {
          Object.assign(v, { cargoName: ci.cargoName });
          this.vehicles.push(v);
        });
      }
    }
    this.cargoItems = cargoItems;
    this.cargoFlow.instockDate = null;
    this.dataSourceCargoItem.data(cargoItems);
    this.dataSourceVehicle.data(this.vehicles);
  }

  /**
   * 根据批次号和入库流水时间生成入库流水单号
   */
  async createInstockFlowNumber() {
    //todo
    //必填项验证  入库单号和入库流水单号的生成问题
    if (this.cargoFlowDatePicker.value()) {
      // let res = await this.codeService.generateCodeByDate("2", this.cargoFlowDatePicker.value().getTime(), this.cargoFlow.batchNumber);
      // this.cargoFlow.instockFlowNumber = res.content;
      let res = await this.codeService.generateCodeByDate("5",this.cargoFlowDatePicker.value().getTime());
      this.cargoFlow.instockFlowNumber = res.content;
    }
  }

  deleteCargoItem(e) {
    this.cargoItems.forEach(ci => {
      if (e.id == ci.id) {
        let index = this.cargoItems.indexOf(ci);
        this.cargoItems.splice(index, 1);
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
  }

  deleteVehicle(e) {
    this.vehicles.forEach(v => {
      if (e.id == v.id) {
        let index = this.vehicles.indexOf(v);
        this.vehicles.splice(index, 1);
        let judge = this.vehicles.filter(vv => vv.instockGoodsId == v.instockGoodsId);
        if (judge.length == 0) {
          e.id = v.instockGoodsId;
          this.deleteCargoItem(e);
        }
      }
    });
    this.dataSourceVehicle.data(this.vehicles);
  }


  async addCargoFlowSeparate() {
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
          if (ci.sign == v.sign) {
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

    this.disabled = true;
    try {
      await this.cargoFlowSeparateService.saveCargoFlowSeparate(this.cargoFlow);
      await this.messageDialogService.alert({ title: "拆单补录成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "拆单补录失败", message: err.message, icon: 'error' });
      this.disabled = false;
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

  .ensure((cargoFlow: CargoFlow) => cargoFlow.instockFlowNumber)
  .displayName('拆单后入库流水单号')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((cargoFlow: CargoFlow) => cargoFlow.instockDate)
  .displayName('入库流水拆单时间')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((cargoFlow: CargoFlow) => cargoFlow.contactNumber)
  .displayName('联系电话')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies(x => /^[1][358][0-9]{9}$/.test(x)).withMessage(` 请输入正确的11位手机号码 e.g.139 0000 0000`)

  .ensure((cargoFlow: CargoFlow) => cargoFlow.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;