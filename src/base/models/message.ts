import { ValidationRules } from 'aurelia-validation';
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

export const validationRules = ValidationRules
  .ensure((message: Message) => message.title)
  .displayName('标题')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((message: Message) => message.content)
  .displayName('内容')
  .required().withMessage(`\${$displayName}不能为空`)
  .maxLength(200).withMessage(`\${$displayName}长度不能大于200`)
  .rules;