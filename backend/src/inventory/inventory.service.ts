import { Injectable } from "@nestjs/common";
import { getFlowsByStore, getStoreList, updateFlowStatus, mockFlows } from "./inventory.data";

@Injectable()
export class InventoryService {
  getFlows(storeName?: string, flowType?: string, page?: number, pageSize?: number) {
    return getFlowsByStore(storeName, flowType, page, pageSize);
  }

  getStores() {
    return getStoreList();
  }

  updateStatus(id: number, status: string) {
    return updateFlowStatus(id, status);
  }

  getOperationRecords() {
    const abnormalCount = mockFlows.filter(f => f.status === "ABNORMAL").length;
    const pendingCount = mockFlows.filter(f => f.status === "PENDING").length;
    const todayIn = mockFlows.filter(f => f.flowType === "PURCHASE_IN").length;
    const todayOut = mockFlows.filter(f => f.flowType === "SALE_OUT").length;

    return [
      {
        key: "inv-flow-1",
        name: "门店出入库流水",
        owner: "运营组",
        status: abnormalCount > 0 ? "待核查" : "正常",
        metric: `${abnormalCount} 异常`,
        priority: abnormalCount > 0 ? "高" : "中",
      },
      {
        key: "inv-flow-2",
        name: "今日采购入库",
        owner: "仓库组",
        status: "处理中",
        metric: `${todayIn} 单`,
        priority: "中",
      },
      {
        key: "inv-flow-3",
        name: "今日销售出库",
        owner: "门店组",
        status: "进行中",
        metric: `${todayOut} 单`,
        priority: "高",
      },
      {
        key: "inv-flow-4",
        name: "待处理异常",
        owner: "审核组",
        status: pendingCount > 0 ? "待跟进" : "已完成",
        metric: `${pendingCount} 项`,
        priority: pendingCount > 0 ? "高" : "低",
      },
    ];
  }
}
