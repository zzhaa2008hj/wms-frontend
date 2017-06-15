import { autoinject } from "aurelia-dependency-injection";
import { extractResult, Query, RestClient } from "../../utils";
import { DictionaryData } from "../models/DictionaryData";
import { Dictionary } from "../models/Dictionary";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class DictionaryService {
  constructor(private http: RestClient) {
  }

  queryDictionary(param?: { name: string }): Query<any> {
    return  this.http.query(`/base/dictionary/page`, param);
  }

  async saveDictionary(dictionary: Dictionary) {
    let url = `/base/dictionary`;
    let res = await this.http.createRequest(url).withContent(dictionary).asPost().send();
    return extractResult(res.content);
  }


 async updateState(id: string ) {
   let url = `/base/dictionary/${id}`;
   let res = await this.http.createRequest(url).asPut().send();
   return extractResult(res.content);
  }

  async getDictionary(id: string) {
    let url = `/base/dictionary/${id}`;
    let res = await this.http.createRequest(url).asGet().send();
    return res.content;
  }

  async updateDictionary(dictionary: Dictionary) {
    let url = `/base/dictionary`;
    let res = await this.http.createRequest(url).withContent(dictionary).asPut().send();
    return extractResult(res.content);
  }
}

@autoinject
export class DictionaryDataService {
  constructor(private http: RestClient) {
  }

  queryDictionaryData(param?: { name: string }): Query<any> {
    return  this.http.query(`/base/dictionaryData/page`, param);
  }

  async saveDictionaryData(dictionaryData: DictionaryData) {
    let url = `/base/dictionaryData`;
    let res = await this.http.createRequest(url).withContent(dictionaryData).asPost().send();
    return extractResult(res.content);
  }


 async updateState(id: string ) {
   let url = `/base/dictionaryData/${id}`;
   let res = await this.http.createRequest(url).asPut().send();
   return extractResult(res.content);
  }

  async getDictionaryData(id: string) {
    let url = `/base/dictionaryData/${id}`;
    let res = await this.http.createRequest(url).asGet().send();
    return res.content;
  }

  async updateDictionaryData(dictionaryData: DictionaryData) {
    let url = `/base/dictionaryData`;
    let res = await this.http.createRequest(url).withContent(dictionaryData).asPut().send();
    return extractResult(res.content);
  }
}