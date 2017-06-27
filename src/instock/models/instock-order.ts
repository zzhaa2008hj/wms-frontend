/**
 * Created by shun on 2017/6/26.
 */
import {OrderItem} from "./order-item";
export interface InstockOrder {
    id: string;
    // 货物信息表主键
    cargoInfoId: string;
    // 入库单号
    instockOrderNumber: string;
    // 代理商主键
    agentId: string;
    // 代理商名称
    agentName: string;
    // 客户主键
    customerId: string;
    // 客户名称
    customerName: string;
    // 批次号
    batchNumber: string;
    // 合计重量
    sumQuantity: number;
    // 合计件数
    sumNumber: number;
    // 计量单位
    unit: string;

    remark: string;

    orgId: string;
}

export interface InstockOrderVo {
    order: InstockOrder;
    orderItems: OrderItem[];
}