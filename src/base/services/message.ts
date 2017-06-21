import { autoinject } from "aurelia-dependency-injection";
import { dateConverter, extractResult, handleResult, Query, RestClient } from "../../utils";
import { Message } from "../models/message";
/**
 * Created by Hui on 2017/6/15.
 */
@autoinject
export class MessageService {
  constructor(private http: RestClient) {
  }

  queryMessages(param?: { keywords: string }): Query<any> {
    return this.http.query(`/base/message/page`, param).map(dateConverter("sendDate"));
  }

  saveMessage(message: Message) {
    this.http.post(`/base/message`, message).then(handleResult);
  }

  async listCustomer() {
    return await this.http.get(`/base/customer/list`);
  }
}

@autoinject
export class MessageResultService {
  constructor(private http: RestClient) {
  }


}