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

  async getOrganization(id: string): Promise<Organization> {
    let res = await this.http.get(`base/customer/${id}`);
    return res.content;
  }

  async saveOrganization(organization: Organization, organizationTypeCode: string): Promise<any> {
    let res = await this.http.post(`base/customer?customerType=${organizationTypeCode}`, organization)
    return extractResult(res.content);
  }

  async updateOrganization(id: string, organization: any): Promise<any> {
    let res = await this.http.put(`base/customer/${id}`, organization);
    return extractResult(res.content);
  }

  async changeStatus(id: string, status: string): Promise<any> {
    let res = await this.http.put(`base/customer/updateStatus/${id}?status=${status}`, '')
    return extractResult(res.content);
  }

}                                                             