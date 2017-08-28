import { RestClient, Query } from "@app/utils";
import { LedgerAccount } from "@app/report/models/ledger-account";
import { autoinject } from "aurelia-dependency-injection";

export interface Criteria {
  type?: number;
  batchNumber?: string;
}

@autoinject
export class LedgerAccountService {
  constructor(private http: RestClient) {
  }

  page(criteria?: Criteria): Query<LedgerAccount> {
    return this.http.query<LedgerAccount>(`/report/ledger-account/page`, criteria);
  }
}