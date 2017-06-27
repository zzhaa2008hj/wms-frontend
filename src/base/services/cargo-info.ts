import { autoinject } from "aurelia-dependency-injection";
import { dateConverter, fixDate, handleResult, Query, RestClient } from "../../utils";
import { Contract } from "../contract/index";
import { ContractVo } from "../models/contractVo";
import { WorkInfo } from "../models/work-info";
import {Rate, RateStep} from "../models/rate";
import { Organization } from "../models/organization";
import {CargoInfo} from "../models/cargo-info";
/**
 * 机构查询条件
 */
export interface CargoInfoCriteria {
    searchName?: string;
    instockBeginDate?: Date;
    instockEndDate?: Date;
}

@autoinject
export class CargoInfoService {
    constructor(private http: RestClient) {
    }

    queryCargoInfo(criteria?: CargoInfoCriteria): Query<CargoInfo> {
        return this.http.query(`base/cargoInfo/page`, criteria);
    }












    /**
     * 查询库区信息
     * @returns {Promise<WorkInfo[]>}
     */
    async getWarehouses(): Promise<WorkInfo[]> {
        let res = await this.http.get(`base/warehouse/list`);
        return res.content;
    }

    async getCustomers(customerType: number): Promise<Organization[]> {
        let res = await this.http.get(`base/customer/list?customerType=${customerType}`);
        return res.content;
    }

    /**
     * 获取基础费率和阶梯费率
     * @returns {Promise<RateAndRateStep[]>}
     */
    async getBaseRate(): Promise<Rate[]> {
        let res = await this.http.get(`base/rate/list`);
        return res.content;
    }

    /**
     * 获取阶梯费率
     * @returns {Promise<RateStep[]>}
     */
    async getBaseRateStep(): Promise<RateStep[]> {
        let res = await this.http.get(`base/rateStep/list`);
        return res.content;
    }

    /**
     * 获取单个合同信息
     * @param id
     * @returns {Promise<ContractVo>}
     */
    async getContract(id: string): Promise<ContractVo> {
        return this.http.get(`base/contract/${id}`)
            .then(res => {
                let contractVo = res.content;
                fixDate(contractVo.contract, 'signDate', 'startTime', 'endTime');
                return contractVo;
            });
    }

    /**
     * 新增保存
     * @param contractVo
     * @returns {Promise<void>}
     */
    saveContract(contractVo: ContractVo): Promise<void> {
        return this.http.post(`base/contract`, contractVo).then(handleResult);
    }

    /**
     * 编辑保存
     * @param contractVo
     * @returns {Promise<void>}
     */
    updateContract(contractId: string, contractVo: ContractVo): Promise<void> {
        return this.http.put(`base/contract/${contractId}`, contractVo).then(handleResult);
    }

    /**
     * 删除合同
     * @param id
     * @returns {Promise<void>}
     */
    delete(id: string): Promise<void> {
        return this.http.delete(`base/contract/${id}`).then(handleResult);
    }

    audit(id: string, status: number): Promise<void> {
        return this.http.put(`base/contract/verifyContract/${id}?status=${status}`, '').then(handleResult);
    }
}