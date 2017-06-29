/**
 * Created by Hui on 2017/6/19.
 */
export interface Message {
  id?: string;
  orgId: string;
  category: number;
  title: string;
  content: string;
  senderId: string;
  sender: string;
  sendDate: Date;
}

export interface MessageResult {
  id?: string;
  orgId: string;
  messageId: string;
  hasRead: number;
  receiverId: string;
  receiverName: string;
  modifyTime: Date;
}

export interface MessageVo {
  message: Message;
  receivers: MessageResult[];
}