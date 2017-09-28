import { RestClient, Query, handleResult } from '@app/utils';
import { autoinject } from 'aurelia-framework';
import { CargoInventoryVO, CargoInventory, CargoInventoryItem } from '@app/cargo-inventory/models/cargo-inventoty';

@autoinject
export class CargoInventoryService {
  constructor(private http: RestClient) {
  }

  queryCargoInventoryPage(keywords?: string): Query<CargoInventory> {
    return this.http.query(`/cargo-inventory/info/page`, {keywords});
  }

  saveCargoInventory(cargoInventory: CargoInventory): Promise<void> {
    return this.http.post(`/cargo-inventory/info`, cargoInventory).then(handleResult);
  }

  getCargoInventory(id: string): Promise<CargoInventoryVO> {
    return this.http.get(`/cargo-inventory/info/${id}`).then(res => res.content);
  }

  saveItems(cargoInventoryVO: CargoInventoryVO): Promise<void> {
    return this.http.createRequest(`/cargo-inventory/info/${cargoInventoryVO.cargoInventory.id}/items`)
      .withContent(cargoInventoryVO).asPut().send().then(handleResult);
  }
}