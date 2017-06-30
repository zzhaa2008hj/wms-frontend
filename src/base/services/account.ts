import { handleResult, RestClient } from "../../utils";
import { inject } from "aurelia-dependency-injection";
export class AccountService {
  constructor(@inject private http: RestClient) {
  }

  getMenu()  {
    return this.http.get(`/rest/account/menu`).then(handleResult);
  }


}