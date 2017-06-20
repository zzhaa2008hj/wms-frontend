import { autoinject } from "aurelia-dependency-injection";
import { extractResult, Query, RestClient } from "../../utils";
import { Message } from "../models/message";
/**
 * Created by Hui on 2017/6/15.
 */
@autoinject
export class MessageService {
  constructor(private http: RestClient) {
  }

  queryMessages(param?: { keywords: string }): Query<any> {
    return this.http.query(`/base/message/page`, param);
  }

  async saveMessage(message: Message): Promise<void> {
    let url = `/base/message`;
    let res = await this.http.createRequest(url).withContent(message).asPost().send();
    return extractResult(res.content);
  }

  async updateMessage(message: any): Promise<void> {
    let url = `/base/message`;
    let res = await this.http.createRequest(url).withContent(message).asPut().send();
    return extractResult(res.content);
  }

  async deleteMessage(id: string): Promise<void> {
    let url = `/base/message/${id}`;
    let res = await this.http.createRequest(url).asDelete().send();
    return extractResult(res.content);
  }

}

@autoinject
export class MessageResultService {
  constructor(private http: RestClient) {
  }

  async saveMessageResult(messageResult: Message): Promise<void> {
    let url = `/base/messageResult`;
    let res = await this.http.createRequest(url).withContent(messageResult).asPost().send();
    return extractResult(res.content);
  }

  async updateMessageResult(message: any): Promise<void> {
    let url = `/base/messageResult`;
    let res = await this.http.createRequest(url).withContent(message).asPut().send();
    return extractResult(res.content);
  }

  async deleteMessageResult(id: string) {
    let url = `/base/messageResult/${id}`;
    let res = await this.http.createRequest(url).asDelete().send();
    return extractResult(res.content);
  }

}