import { autoinject } from "aurelia-dependency-injection";
import { dateConverter, handleResult, Query, RestClient } from "@app/utils";
import { Message } from "@app/base/models/message";
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

  saveMessage(message: Message): Promise<void> {
    return this.http.post(`/base/message`, message).then(handleResult);
  }

  async listCustomer(): Promise<any[]> {
    let res = await this.http.get(`/base/customer/list`);
    return res.content;
  }
}

@autoinject
export class MessageResultService {

}