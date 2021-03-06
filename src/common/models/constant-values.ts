export class ConstantValues {

  static get BusinessTypes() {
    return [{
      type: 1,
      name: "入库"
    }, {
      type: 2,
      name: "出库"
    }, {
      type: 3,
      name: "货权转移"
    }, {
      type: 4,
      name: "货位转移"
    }, {
      type: 5,
      name: "货物质押"
    }, {
      type: 6,
      name: "合同"
    }, {
      type: 7,
      name: "零星作业"
    }, {
      type: 8,
      name: "收费"
    }, {
      type: 9,
      name: "付费"
    }];
  }

  static get ContractStage() {
    return [{
      stage: -1,
      title: "撤回中"
    }, {
      stage: 0,
      title: "初始阶段"
    }, {
      stage: 1,
      title: "待审核"
    }, {
      stage: 2,
      title: "未通过审核"
    }, {
      stage: 3,
      title: "审核通过"
    }, {
      stage: 4,
      title: "生效中"
    }, {
      stage: 5,
      title: "已失效"
    }];
  }

  static get InstockStages() {
    return [{
      stage: -1,
      title: "撤回中"
    }, {
      stage: 0,
      title: "初始阶段"
    }, {
      stage: 1,
      title: "待商务审核"
    }, {
      stage: 2,
      title: "商务审核未通过"
    }, {
      stage: 3,
      title: "商务审核通过"
    }, {
      stage: 4,
      title: "已生成入库指令单"
    }, {
      stage: 5,
      title: "入库作业中"
    }, {
      stage: 6,
      title: "作业完成（待审核）"
    }, {
      stage: 7,
      title: "库场审核未通过"
    }, {
      stage: 8,
      title: "库场审核通过"
    }, {
      stage: 9,
      title: "已生成理货报告"
    }, {
      stage: 10,
      title: "已生成入库单"
    }, {
      stage: 11,
      title: "入库完成"
    }];
  }

  static get ChargeCategory() {
    return [{ text: "仓储费", value: 1 }, { text: "装卸费", value: 2 }, { text: "其他费用", value: 3 }];
  }

  static get ChargeCategoryVo() {
    return [{ text: "仓储费", value: 1 }, { text: "作业费(装卸+其他)", value: 2 }];
  }

  static get CustomerCategory() {
    return [{ text: "仓储客户", value: 1 }, { text: "装卸单位", value: 2 }];
  }

  static get ChargeType() {
    return [{ text: "收费业务", value: 1 }, { text: "付费业务", value: 2 }];
  }

  static get PricingMode() {
    return [{ text: "单一计费", value: 1 }, { text: "阶梯计费", value: 2 }];
  }

  static get ContractTypes() {
    return [{ "name": "仓储合同", "type": 1 }, { "name": "装卸合同", "type": 2 }, { "name": "库区租赁", "type": 3 }];
  }

  static get WorkInfoCategory() {
    return [{ text: "入库", value: 1 }, { text: "出库", value: 2 }, { text: "货权转移", value: 3 }, { text: "货位转移", value: 4 }];
  }

  static get OutstockStages() {
    return [{
      stage: -1,
      title: "撤回中"
    }, {
      stage: 0,
      title: "初始阶段"
    }, {
      stage: 1,
      title: "待商务审核"
    }, {
      stage: 2,
      title: "商务审核未通过"
    }, {
      stage: 3,
      title: "商务审核通过"
    }, {
      stage: 4,
      title: "费收审核未通过"
    }, {
      stage: 5,
      title: "费收审核通过（收费完成）"
    }, {
      stage: 6,
      title: "费收审核通过（先装货后收费）"
    }, {
      stage: 7,
      title: "副总审批通过"
    }, {
      stage: 8,
      title: "已生成出库单"
    }, {
      stage: 9,
      title: "已上传提货信息"
    }, {
      stage: 10,
      title: "商务审核未通过"
    }, {
      stage: 11,
      title: "商务审核通过"
    }, {
      stage: 12,
      title: "已生成出库指令单"
    }, {
      stage: 13,
      title: "出库作业中"
    }, {
      stage: 14,
      title: "作业完成（待审核）"
    }, {
      stage: 15,
      title: "库场审核未通过"
    }, {
      stage: 16,
      title: "库场审核通过"
    }, {
      stage: 17,
      title: "商务已确认"
    }, {
      stage: 18,
      title: "已生成出库清单"
    }, {
      stage: 19,
      title: "出库完成"
    }];
  }

  static get PayStage() {
    return [{
      stage: 0,
      title: "未结算"
    }, {
      stage: 1,
      title: "已生成对账清单"
    }, {
      stage: 2,
      title: "装卸单位未确认"
    }, {
      stage: 3,
      title: "装卸单位确认"
    }, {
      stage: 4,
      title: "费收审核拒绝"
    }, {
      stage: 5,
      title: "费收审核通过"
    }, {
      stage: 6,
      title: "已核对生成付费单"
    }, {
      stage: 7,
      title: "领导签字审核"
    }, {
      stage: 8,
      title: "已开票"
    }, {
      stage: 9,
      title: "核销"
    }, {
      stage: 10,
      title: "付费完成"
    }];
  }

  static get PaymentInfoType() {
    return [{
      stage: 1,
      title: "自动生成"
    }, {
      stage: 2,
      title: "手动新增"
    }];
  }

  static get InvoiceStatus() {
    return [{
      stage: 0,
      title: "未开票"
    }, {
      stage: 1,
      title: "已开票"
    }];
  }

  static get PaymentStatus() {
    return [{
      stage: 0,
      title: "未付款"
    }, {
      stage: 1,
      title: "已付款"
    }];
  }

  static get InvoiceType() {
    return [{
      stage: 1,
      title: "普通发票"
    }, {
      stage: 2,
      title: "增值税发票"
    }];
  }

  static get ChargeStage() {
    return [{
      stage: 0,
      title: "未结算"
    }, {
      stage: 1,
      title: "已生成对账清单"
    }, {
      stage: 2,
      title: "客户未确认"
    }, {
      stage: 3,
      title: "客户确认"
    }, {
      stage: 4,
      title: "费收审核拒绝"
    }, {
      stage: 5,
      title: "费收审核通过"
    }, {
      stage: 6,
      title: "已核对生成收费单"
    }, {
      stage: 7,
      title: "已开票"
    }, {
      stage: 8,
      title: "核销"
    }, {
      stage: 9,
      title: "收费完成"
    }];
  }

  static get FeeType() {
    return [{
      stage: 1,
      title: "收费"
    }, {
      stage: 2,
      title: "付费"
    }];
  }

  static get FeeStatus() {
    return [{
      status: -1,
      title: "作废"
    }, {
      status: 0,
      title: "未完成"
    }, {
      status: 1,
      title: "完成"
    }];
  }

  static get weekInfo() {
    return [{
      stage: "1",
      title: "星期日"
    },
    {
      stage: "2",
      title: "星期一"
    },
    {
      stage: "3",
      title: "星期二"
    },
    {
      stage: "4",
      title: "星期三"
    },
    {
      stage: "5",
      title: "星期四"
    }, {
      stage: "6",
      title: "星期五"
    },
    {
      stage: "7",
      title: "星期六"
    }];
  }

  static get monthInfo() {
    return [{
      stage: "01",
      title: "一月份"
    }, {
      stage: "02",
      title: "二月份"
    }, {
      stage: "03",
      title: "三月份"
    }, {
      stage: "04",
      title: "四月份"
    }, {
      stage: "05",
      title: "五月份"
    }, {
      stage: "06",
      title: "六月份"
    }, {
      stage: "07",
      title: "七月份"
    }, {
      stage: "08",
      title: "八月份"
    }, {
      stage: "09",
      title: "九月份"
    }, {
      stage: "10",
      title: "十月份"
    }, {
      stage: "11",
      title: "十一月份"
    }, {
      stage: "12",
      title: "十二月份"
    }];
  }

  static get OrgProperties() {
    return [{ value: 1, name: "个人" }, { value: 2, name: "公司" }];
  }

  static get CargoOwnershipStage() {
    return [{
      stage: -1,
      title: "撤回中"
    }, {
      stage: 0,
      title: "初始阶段"
    }, {
      stage: 1,
      title: "待商务审核"
    }, {
      stage: 2,
      title: "商务审核未通过"
    }, {
      stage: 3,
      title: "商务审核通过"
    }, {
      stage: 4,
      title: "费收审核未通过"
    }, {
      stage: 5,
      title: "费收审核通过（收费完成）"
    }, {
      stage: 6,
      title: "费收审核通过（挂账）"
    }, {
      stage: 7,
      title: "副总审批通过"
    }, {
      stage: 8,
      title: "作业中"
    }, {
      stage: 9,
      title: "作业完成"
    }, {
      stage: 10,
      title: "已生成入库单"
    }, {
      stage: 11,
      title: "货转完成"
    }];
  }

  static get DemandFrom() {
    return [{
      type: 1,
      name: "外部"
    }, {
      type: 2,
      name: "内部"
    }];
  }

  static get CalculateStandard() {
    return [{
      text: "堆存天数",
      value: 1
    }, {
      text: "库存数量",
      value: 2
    }];
  }

  static get CargoMortgageStage() {
    return [{
      stage: -1,
      title: "撤回中"
    }, {
      stage: 0,
      title: "质押初始阶段"
    }, {
      stage: 1,
      title: "待商务审核"
    }, {
      stage: 2,
      title: "商务审核拒绝"
    }, {
      stage: 3,
      title: "商务审核通过"
    }, {
      stage: 4,
      title: "质押中"
    }, {
      stage: 5,
      title: "解押初始阶段"
    }, {
      stage: 6,
      title: "待商务审核（解押）"
    }, {
      stage: 7,
      title: "商务审核拒绝（解押）"
    }, {
      stage: 8,
      title: "商务审核通过（解押）"
    }, {
      stage: 9,
      title: "经理审批通过（解押）"
    }, {
      stage: 10,
      title: "解押完成"
    }];
  }

  static get CargoPositionStage() {
    return [{
      stage: -1,
      title: "撤回中"
    }, {
      stage: 0,
      title: "初始阶段"
    }, {
      stage: 1,
      title: "待商务审核"
    }, {
      stage: 2,
      title: "商务审核未通过"
    }, {
      stage: 3,
      title: "商务审核通过"
    }, {
      stage: 4,
      title: "客户/领导签字确认"
    }, {
      stage: 5,
      title: "已生成作业指令单"
    }, {
      stage: 6,
      title: "作业中"
    }, {
      stage: 7,
      title: "作业完成"
    }, {
      stage: 8,
      title: "库场审核未通过"
    }, {
      stage: 9,
      title: "库场审核通过"
    }, {
      stage: 10,
      title: "货转完成"
    }];
  }
}