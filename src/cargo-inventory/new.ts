import { autoinject, observable } from 'aurelia-framework';
import { ConstantValues } from '@app/common/models/constant-values';
import { CargoInventory, cargoInventoryValidationRules } from '@app/cargo-inventory/models/cargo-inventoty';
import { DialogService, MessageDialogService } from 'ui';
import { Organization } from '@app/base/models/organization';
import { CargoInfoService } from '@app/base/services/cargo-info';
import { UnlimitedWarehouseTree } from "@app/base/warehouse/unlimited-tree";
import { ValidationControllerFactory, ValidationController } from 'aurelia-validation';
import { Container } from 'aurelia-dependency-injection';
import { formValidationRenderer } from '@app/validation/support';
import { CargoInventoryService } from '@app/cargo-inventory/services/cargo-inventory';
import { Router } from 'aurelia-router';
import { UnlimitedCargoCategoryTree } from '@app/base/cargo-category/unlimited-tree';

@autoinject
export class NewCargoInventory {

  demandFrom = ConstantValues.DemandFrom;
  cargoInventory = {} as CargoInventory;
  customers = [] as Organization[];
  @observable disabled = false;
  validationController: ValidationController;
  startDatePicker: kendo.ui.DatePicker;
  endDatePicker: kendo.ui.DatePicker;

  constructor(private cargoInventoryService: CargoInventoryService,
              private router: Router,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService,
              private cargoInfoService: CargoInfoService,
              validationControllerFactory: ValidationControllerFactory,              
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate() {
    this.validationController.addObject(this.cargoInventory, cargoInventoryValidationRules);    
    this.cargoInventory.demandFrom = 1;    
    this.customers = await this.cargoInfoService.getCustomers(1);
  }

  afterAttached() {
    this.startDatePicker.max(new Date());
    this.endDatePicker.max(new Date());
  }

  async add() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    this.disabled = true;
    try {
      await this.cargoInventoryService.saveCargoInventory(this.cargoInventory);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
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

  async selectCargoCategory() {
    let result = await this.dialogService
      .open({ viewModel: UnlimitedCargoCategoryTree, model: this.cargoInventory.cargoCategoryId, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let cargoCategory = result.output;
    this.cargoInventory.cargoCategoryName = cargoCategory.categoryName;
    this.cargoInventory.cargoCategoryId = cargoCategory.id;
  }

  async selectWarehouse() {
    let result = await this.dialogService
      .open({ viewModel: UnlimitedWarehouseTree, model: this.cargoInventory.warehouseId, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    this.cargoInventory.warehouseName = result.output.name;
    this.cargoInventory.warehouseId = result.output.id;
  }

  onSelectAgent(e) {
    let agent = e.dataItem as Organization;
    this.cargoInventory.agentName = agent.shortName;
    this.cargoInventory.customerId = agent.id;
    this.cargoInventory.customerName = agent.shortName;
  }

  onSelectCustomer(e) {
    let customer = e.dataItem as Organization;
    this.cargoInventory.customerId = customer.id;
    this.cargoInventory.customerName = customer.shortName;
  }

  onSelectDemand(e) {
    let demandFrom = e.dataItem as number;
    if (demandFrom == 1) {
      this.cargoInventory.warehouseId = '';
      this.cargoInventory.warehouseName = '';
    } else {
      this.cargoInventory.agentId = '';
      this.cargoInventory.agentName = '';
      this.cargoInventory.customerId = '';
      this.cargoInventory.customerName = '';
    }
  }
}