import { Router } from 'aurelia-router';
import { MessageDialogService } from 'ui';
import { autoinject, observable } from 'aurelia-framework';
import { CargoMortgage, cargoMortgageValidateRules } from '@app/cargo-mortgage/models/cargo-mortgage';
import { CargoInfo, CargoItem } from '@app/base/models/cargo-info';
import { CargoInfoService } from '@app/base/services/cargo-info';
import { ValidationControllerFactory, ValidationController } from 'aurelia-validation';
import { Container } from 'aurelia-dependency-injection';
import { formValidationRenderer } from '@app/validation/support';
import { CodeService } from '@app/common/services/code';
import { OrganizationService } from '@app/base/services/organization';
import { Organization } from '@app/base/models/organization';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { UnfrozenStorage } from '@app/base/models/storage';
import { BaseCargoItemService } from '@app/base/services/cargo-item';
import { CargoMortgageService } from '@app/cargo-mortgage/services/cargo-mortgage';

@autoinject
export class NewCargoMortgage {

  cargoMortgage = {} as CargoMortgage;
  cargoInfos = [] as CargoInfo[];
  cargoItems = [] as CargoItem[];
  units = [] as DictionaryData[];
  cargoItemDataSource = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.cargoItems);
      }
    }
  });
  unfrozenStorage = {} as UnfrozenStorage;
  customers = [] as Organization[];
  startDatePicker: kendo.ui.DatePicker;
  endDatePicker: kendo.ui.DatePicker;
  @observable disabled = false;
  validationController: ValidationController;

  constructor(private cargoInfoService: CargoInfoService,
              private baseCargoItemService: BaseCargoItemService,
              private cargoMortgageService: CargoMortgageService,
              private codeService: CodeService,
              private customerService: OrganizationService,
              private dictionaryDataService: DictionaryDataService,
              private messageDialogService: MessageDialogService,
              private router: Router,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate() {
    this.validationController.addObject(this.cargoMortgage, cargoMortgageValidateRules);    
    this.cargoInfos = await this.cargoInfoService.listBaseCargoInfos({ instockStatus: -3, outstockStatus: 0 });
    this.cargoInfos.map(res => {
      res.batchNumberStr = res.batchNumber + "(" + res.customerName + ")";
    });
    this.cargoMortgage.codeNumber = await this.codeService.generateCode("4").then(res => res.content);
    this.cargoMortgage.pledgeNumber = 0;
    this.cargoMortgage.pledgeQuantity = 0;
    this.customers = await this.customerService.listWithContract();
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
  }

  startChange() {
    let startDate = this.startDatePicker.value();
    let endDate = this.endDatePicker.value();

    if (startDate) {
      startDate = new Date(startDate);
      startDate.setDate(startDate.getDate());
      this.endDatePicker.min(startDate);
    } else if (endDate) {
      this.startDatePicker.max(new Date(endDate));
    } else {
      endDate = new Date();
      this.startDatePicker.max(endDate);
      this.endDatePicker.min(endDate);
    }
  }

  endChange() {
    let endDate = this.endDatePicker.value();
    let startDate = this.startDatePicker.value();

    if (endDate) {
      endDate = new Date(endDate);
      endDate.setDate(endDate.getDate());
      this.startDatePicker.max(endDate);
    } else if (startDate) {
      this.endDatePicker.min(new Date(startDate));
    } else {
      endDate = new Date();
      this.startDatePicker.max(endDate);
      this.endDatePicker.min(endDate);
    }
  }

  async onSelectCargoInfo(e) {
    let cargoInfo = e.dataItem as CargoInfo;
    this.cargoMortgage.batchNumber = cargoInfo.batchNumber;
    this.cargoMortgage.cargoInfoId = cargoInfo.id;
    this.cargoMortgage.pledgorId = cargoInfo.customerId;
    this.cargoMortgage.pledgorName = cargoInfo.customerName;

    this.cargoItems = await this.cargoInfoService.getCargoItems(cargoInfo.id);
    this.cargoItemDataSource.read();
  }

  async onSelectCustomer(e) {
    let org = e.dataItem as Organization;
    if (this.cargoMortgage.pledgorId == org.id) {
      await this.messageDialogService.alert({ title: "提示", message: '出质客户和质权客户不能是同一个客户', icon: 'error' });
      this.cargoMortgage.pledgeeId = '';
      return;
    }
    this.cargoMortgage.pledgeeId = org.id;
    this.cargoMortgage.pledgeeName = org.shortName;
  }

  async onSelectCargoItem(e) {
    let cargoItem = e.dataItem as CargoItem;
    if (cargoItem.id) {
      this.cargoMortgage.cargoItemId = cargoItem.id;
      this.cargoMortgage.cargoName = cargoItem.cargoName;
      this.cargoMortgage.cargoCategoryName = cargoItem.cargoCategoryName;
      this.cargoMortgage.unit = cargoItem.unit;
      if (cargoItem.unit) {
        this.cargoMortgage.unitStr = this.units.find(d => d.dictDataCode == this.cargoMortgage.unit).dictDataName;      
      }
      this.unfrozenStorage = await this.baseCargoItemService.getUnfrozenQuantity(cargoItem.id);
      this.cargoMortgage.unfrozenNumber = this.unfrozenStorage.sumNumber;
      this.cargoMortgage.unfrozenQuantity = this.unfrozenStorage.sumQuantity;
    } else {
      this.cargoMortgage.cargoItemId = '';
      this.cargoMortgage.cargoName = '';
      this.cargoMortgage.cargoCategoryName = '';
      this.cargoMortgage.unit = '';
      this.cargoMortgage.unitStr = '';
      this.unfrozenStorage = {} as UnfrozenStorage;
      this.cargoMortgage.unfrozenNumber = 0;
      this.cargoMortgage.unfrozenQuantity = 0;
    }
  }

  async save() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    this.disabled = true;
    try {
      await this.cargoMortgageService.saveCargoMortgage(this.cargoMortgage);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

  cancel() {
    this.router.navigateToRoute('list');
  }
}