import { autoinject } from 'aurelia-framework';
import { ConstantValues } from '@app/common/models/constant-values';
import { CargoInventory } from '@app/cargo-inventory/models/cargo-inventoty';
import { DialogService } from 'ui';
import { WarehouseTree } from "@app/base/warehouse/tree";
import { Organization } from '@app/base/models/organization';
import { CargoInfoService } from '@app/base/services/cargo-info';
import { CargoCategoryTree } from "@app/base/cargo-category/tree";

@autoinject
export class NewCargoInventory {

  demandFrom = ConstantValues.DemandFrom;
  cargoInventory = {} as CargoInventory;
  customers = [] as Organization[];

  constructor(private dialogService: DialogService,
              private cargoInfoService: CargoInfoService) {
    this.cargoInventory.demandFrom = 1;
  }

  async activate() {
    this.customers = await this.cargoInfoService.getCustomers(1);
  }

  onSelectDemandFrom(e) {
    console.log(e);
    console.log(this.cargoInventory);
  }

  add() {
    
  }

  async selectCargoCategory() {
    let result = await this.dialogService
    .open({ viewModel: CargoCategoryTree, model: this.cargoInventory.cargoCategoryId, lock: true })
    .whenClosed();
    if (result.wasCancelled) return;
    let cargoCategory = result.output;
    this.cargoInventory.cargoCategoryName = cargoCategory.categoryName;
    this.cargoInventory.cargoCategoryId = cargoCategory.id;
  }

  async selectWarehouse() {
    let result = await this.dialogService
      .open({ viewModel: WarehouseTree, model: this.cargoInventory.warehouseId, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    this.cargoInventory.warehouseName = result.output.name;
    this.cargoInventory.warehouseId = result.output.id;
  }
}