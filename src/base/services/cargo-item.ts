import { autoinject } from 'aurelia-dependency-injection';
import { RestClient } from '@app/utils';
import { UnfrozenStorage } from '@app/base/models/storage';

@autoinject
export class BaseCargoItemService {
  constructor(private http: RestClient) {
  }

  getUnfrozenQuantity(id: string): Promise<UnfrozenStorage> {
    return this.http.get(`/base/cargoItem/unfrozen/${id}`).then(res => res.content);
  }
}