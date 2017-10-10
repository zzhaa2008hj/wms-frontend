export interface BaseEntity {
  id?: string;
  remark?: string;
  orgId: string;
  createTime: Date;
  createAccountId: string;
  createAccount: string;
  modifyTime: Date;
  modifyAccountId: string;
  modifyAccount: string;
  deleteTime: Date;
  deleteAccountId: string;
  deleteAccount: string;
  deleted: boolean;
}