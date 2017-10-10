import { autoinject } from 'aurelia-framework';
import { RestClient, Query, handleResult } from '@app/utils';
import { CargoMortgage } from '@app/cargo-mortgage/models/cargo-mortgage';

export interface SearchCriteria {
  batchNumber?: string;
  codeNumber?: string;
}

@autoinject
export class CargoMortgageService {
  constructor(private http: RestClient) {
  }

  queryCargoMortgagePage(criteria?: SearchCriteria): Query<CargoMortgage> {
    return this.http.query(`/cargo-mortgage/info/page`, criteria);
  }

  saveCargoMortgage(cargoMortgage: CargoMortgage): Promise<void> {
    return this.http.post(`/cargo-mortgage/info`, cargoMortgage).then(handleResult);
  }

  getCargoMortgage(id: string): Promise<CargoMortgage> {
    return this.http.get(`/cargo-mortgage/info/${id}`).then(res => res.content);
  }

  deleteCargoMortgage(id: string): Promise<void> {
    return this.http.delete(`/cargo-mortgage/info/${id}`).then(handleResult);
  }

  cancelMortgage(id: string, cargoMortgage: CargoMortgage): Promise<void> {
    return this.http.put(`/cargo-mortgage/info/${id}/unmortgaged`, cargoMortgage).then(handleResult);
  }

  editCargoMortgage(id: string, cargoMortgage: CargoMortgage): Promise<void> {
    return this.http.put(`/cargo-mortgage/info/${id}/edit`, cargoMortgage).then(res => res.content);
  }

  updateStage(id: string, stage: number): Promise<void> {
    return this.http.put(`/cargo-mortgage/info/${id}/updateStage?stage=${stage}`, {}).then(handleResult);
  }

  /**
   * @param {string} id 
   * @param {number} status 
   * @returns {Promise<void>} 
   * @memberof CargoMortgageService
   */
  auditCargoMortgage(id: string, status: number): Promise<void> {
    return this.http.put(`/cargo-mortgage/info/${id}/audit?verifyStatus=${status}`, {}).then(res => res.content);
  }

  /**
   * @param {string} id 
   * @param {number} status 
   * @returns {Promise<void>} 
   * @memberof CargoMortgageService
   */
  approveCargoMortgage(id: string, status: number): Promise<void> {
    return this.http.put(`/cargo-mortgage/info/${id}/approve?verifyStatus=${status}`, {}).then(res => res.content);
  }
}