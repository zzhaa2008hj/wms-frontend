import { autoinject } from "aurelia-dependency-injection";
import { dateConverter, handleResult, Query, RestClient, fixDate } from '@app/utils';
import { MessageVo, MessageResult, Message } from '@app/base/models/message';

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

    saveMessage(messageVo: MessageVo): Promise<void> {
        return this.http.post(`/base/message`, messageVo).then(handleResult);
    }

    async getMessage(id: string): Promise<Message> {
        let res = await this.http.get(`base/message/${id}`);
        return res.content.content;
    }

    async listCustomer(): Promise<any[]> {
        let res = await this.http.get(`/base/customer/list`);
        return res.content;
    }

    /**
     * 登录用户获取全部/已读消息
     * @param {{read: string}} param 1:未读 ； 0：全部
     * @returns {Query<any>}
     */
    getMsgInfo(param?: { read: string }): Query<any> {
        return this.http.query(`/base/message/getMsg`, param).map(log => fixDate(log, 'sendDate'));
    }

    /**
     * 登录用户未读数据的条数
     */
     async getUnreadNum():Promise<string> {
        let res = await this.http.get(`/base/message/getUnreadNum`);
        return res.content ;
    }

}

@autoinject
export class MessageResultService {
    constructor(private http: RestClient) {
    }

    queryMessageResult(messageId?: string): Query<MessageResult> {
        return this.http.query<MessageResult>(`/base/messageResult/page`, { messageId })
            .map(res => fixDate(res, "modifyTime"));
    }

    updateMessage(messageId: string): Promise<void> {
        return this.http.put(`base/message/${messageId}/changeResult`, {}).then(handleResult);
    }

    setRead(): Promise<void> {
        return this.http.put(`base/message/setRead`, {}).then(handleResult);
    }
}