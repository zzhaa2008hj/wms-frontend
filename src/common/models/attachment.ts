export interface Attachment {
  id: string;
  // 客户主键
  customerId: string;
  // 客户名称
  customerName: string;
  // 业务主键
  businessId: string;
  // 业务类型
  businessType: number;
  businessTypeStr: string;

  baseId: string;
  // 合同号/批次号
  businessNumber: string;
  // 附件名称
  attachmentName: string;
  // 附件地址
  attachmentUrl: string;
  // 预览地址（缩略图地址）
  attachmentViewUrl: string;
  uploadTime: Date;
  uploaderName: string;
  uploaderId: string;
  // 机构主键
  orgId: string;
}

export interface AttachmentMap {
  uuidName: string;
  realName: string;
  //0：删除 1：新增 2：不变
  status?: number;
  path?: string;
}