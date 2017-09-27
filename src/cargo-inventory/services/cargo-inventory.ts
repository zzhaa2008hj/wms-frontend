import { RestClient, Query } from '@app/utils';
import { autoinject } from 'aurelia-framework';
import { CargoInventory } from '@app/cargo-inventory/models/cargo-inventoty';

export interface InventoryCriteria {
  customerName?: string;
  warehouseId?: string;
  cargoCategoryId?: string;
  demandFrom?: number;
}

@autoinject
export class CargoInventoryService {
  constructor(private http: RestClient) {
  }

  queryCargoInventoryPage(criteria?: InventoryCriteria): Query<CargoInventory> {
    return this.http.query(`/cargo-inventory/info/page`, criteria);
  }
}