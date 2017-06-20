/**
 * Created by Hui on 2017/6/19.
 */
export interface Message {
  orgId: string;
// message
  category: number;
  title: string;
  content: string;
  senderId: string;
  sender: string;
  sendDate: Date;

  // messageResult
  messageId: string;
  harRead: number;
  receiverId: string;
  receiverName: string;
}