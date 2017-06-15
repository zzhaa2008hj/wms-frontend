import { Organization } from "../models/organization";
import { autoinject } from "aurelia-dependency-injection";
import { dateConverter, extractResult, Query, RestClient } from "../../utils";

/**
 * 机构查询条件
 */
export interface OrganizationCriteria {
  name?: string;
  customerType?: string;
}

@autoinject
export class OrganizationService {
  constructor(private http: RestClient) {
  }

  queryOrganizations(criteria?: OrganizationCriteria): Query<Organization> {
    return this.http.query(`base/customer/page`, criteria).map(dateConverter('createTime'));
  }

  async getOrganization(id: string) {
    let url = `base/customer/${id}`;
    let res = await this.http.createRequest(url).asGet().send();
    return res.content;
  }

  async saveOrganization(organization: Organization,organizationTypeCode : string) {
    let url = "base/customer";
    let type = { organizationTypeCode: organizationTypeCode};
    let res = await this.http.createRequest(url).withContent(organization).withParams(type).asPost().send();
    return extractResult(res.content);
  }

  async updateOrganization(id: string, organization: any) {
    let url = `base/customer/${id}`;
    let res = await this.http.createRequest(url).withContent(organization).asPut().send();
    return extractResult(res.content);
  }

  async changeStatus(id: string, status: string) {
    let url = `base/customer/updateStatus/${id}`;
    let res = await this.http.createRequest(url).withParams({ status }).asPut().send();
    return extractResult(res.content);
  }

}                                                             