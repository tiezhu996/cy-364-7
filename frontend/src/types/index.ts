export interface FeatureItem {
  id: number;
  title: string;
  description: string;
  status: string;
  metric: string;
}

export interface KpiItem {
  label: string;
  value: string;
  trend: string;
  tone: string;
}

export interface OperationRecord {
  key: string;
  name: string;
  owner: string;
  status: string;
  metric: string;
  priority: string;
}

export type FlowType = "PURCHASE_IN" | "SALE_OUT";
export type FlowStatus = "NORMAL" | "ABNORMAL" | "PENDING";

export interface InventoryFlow {
  id: number;
  storeName: string;
  flowNo: string;
  flowType: FlowType;
  productName: string;
  sku: string;
  quantity: number;
  operator: string;
  status: FlowStatus;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryFlowResponse {
  items: InventoryFlow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OverviewResponse {
  appName: string;
  appCode: string;
  description: string;
  features: FeatureItem[];
  kpis: KpiItem[];
  records: OperationRecord[];
}
