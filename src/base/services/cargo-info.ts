import { autoinject } from "aurelia-dependency-injection";
import { dateConverter, fixDate, handleResult, Query, RestClient } from '../../utils';
import { CargoCategory } from '../models/cargo-category';
import { CargoInfo, CargoInfoVo, CargoRate, CargoRateStep } from '../models/cargo-info';
import { Contract } from '../models/contract';
import { Organization } from '../models/organization';
import { Rate } from '../models/rate';
import { RateStep } from '../models/rate';
import { ContractVo } from "../models/contractVo";
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

    queryCargoInfo(criteria?: CargoInfoCriteria): Query<CargoInfo[]> {
        return this.http.query(`base/cargoInfo/page`, criteria);
    }

    /**
     * 获取货物种类信息
     */
    async getCargoCategories(): Promise<CargoCategory[]> {
        let res = await this.http.get(`base/cargoCategory/list?status=true`);
        return res.content;
    }

    /**
     * 获取合同信息
     * @param contractType
     */
    async getContracts(contractType: number): Promise<Contract[]> {
        let res = await this.http.get(`base/contract/list?contractType=${contractType}`);
        return res.content;
    }

    /**
     * 获取该合同下的所有货物费率信息
     * @param contractId
     * @param wareHouseType
     */
    async getContractCargoRates(contractId: string, wareHouseType: string): Promise<CargoRate[]> {
        let res = await this.http.
            get(`base/contract/contractRateList?contractId=${contractId}&wareHouseType=${wareHouseType}`);
        return res.content;
    }

    /**
     * 获取该合同下的所有货物阶梯费率信息
     * @param contractId
     */
    async getContractCargoRateSteps(contractId: string): Promise<CargoRateStep[]> {
        let res = await this.http.get(`base/contract/contractRateStepList?contractId=${contractId}`);
        return res.content;
    }

    /**
     * 获取客户信息
     * @param customerType
     */
    async getCustomers(customerType: number): Promise<Organization[]> {
        let res = await this.http.get(`base/customer/list?customerType=${customerType}`);
        return res.content;
    }

    getBatchNumber(): Promise<void> {
        return this.http.get(`/base/code/generate?type=0`).then(handleResult);

    }

    /**
     * 新增保存
     * @param contractVo
     * @returns {Promise<void>}
     */
    saveCargoInfo(cargoInfoVo: CargoInfoVo): Promise<void> {
        return this.http.post(`base/cargoInfo`, cargoInfoVo).then(handleResult);
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