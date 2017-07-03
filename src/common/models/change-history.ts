export interface ChangeHistory<T> {
  id: string;
  businessId: string;
  oldObj: T;
  newObj: T;
  createAccount: string;
  createTime: Date;
}