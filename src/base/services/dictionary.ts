import { autoinject } from "aurelia-dependency-injection";
import { extractResult, handleResult, Query, RestClient } from "../../utils";
import { Dictionary } from "../models/Dictionary";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class DictionaryService {
  constructor(private http: RestClient) {
  }

  queryDictionaries(param?: { name: string }): Query<any> {
    return this.http.query(`/base/dictionary/page`, param);
  }

  async saveDictionary(dictionary: Dictionary): Promise<void> {
    return await this.http.post(`/base/dictionary`, dictionary).then(handleResult);
  }


  async updateState(id: string): Promise<void> {
    return await this.http.put(`/base/dictionary/${id}/state`, null).then(handleResult);
  }

  async getDictionary(id: string): Promise<any> {
    return await this.http.get(`/base/dictionary/${id}`);
  }

  async updateDictionary(dictionary: Dictionary): Promise<void> {
    return await this.http.put(`/base/dictionary/${dictionary.id}`, dictionary).then(handleResult);
  }

  async deleteDictionary(id: any) {
    return await this.http.delete(`/base/dictionary/${id}`).then(handleResult);
  }

}

@autoinject
export class DictionaryDataService {
  constructor(private http: RestClient) {
  }

  queryDictionaryDatas(dictCode: string, param?: { name: string }): Query<any> {
    return this.http.query(`/base/dictionaryData/${dictCode}/page`, param);
  }

  saveDictionaryData(dictionaryData: Dictionary) {
    return  this.http.post(`/base/dictionaryData`, dictionaryData).then(handleResult);
  }


  updateState(id: string) {
    return  this.http.put(`/base/dictionaryData/${id}/state`, null).then(handleResult);
  }

  updateDictionaryData(dictionaryData: Dictionary) {
    return  this.http.put(`/base/dictionaryData/${dictionaryData.id}`, dictionaryData).then(handleResult);
  }

  deleteDictionaryData(id: any) {
    return this.http.delete(`/base/dictionaryData/${id}`).then(handleResult);
  }
}