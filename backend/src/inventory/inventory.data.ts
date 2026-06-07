const storeNames = ["朝阳门店", "海淀店", "西城店", "东城店", "丰台店", "通州店"];
const productNames = [
  "伊利纯牛奶250ml",
  "农夫山泉500ml",
  "康师傅红烧牛肉面",
  "乐事原味薯片",
  "奥利奥夹心饼干",
  "可口可乐330ml",
  "青岛啤酒500ml",
  "海飞丝洗发水",
  "蓝月亮洗衣液",
  "维达抽纸",
  "双汇火腿肠",
  "雀巢咖啡",
  "德芙巧克力",
  "益达口香糖",
  "脉动维生素饮料",
];
const skuPrefixes = ["SKU-IL", "SKU-NF", "SKU-KS", "SKU-LS", "SKU-AL", "SKU-KK", "SKU-QD", "SKU-HFS", "SKU-LYL", "SKU-WD", "SKU-SH", "SKU-QC", "SKU-DF", "SKU-YD", "SKU-MD"];
const operators = ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十"];
const flowTypes = ["PURCHASE_IN", "SALE_OUT"];
const statuses = ["NORMAL", "ABNORMAL", "PENDING"];

function generateFlow(id: number) {
  const storeName = storeNames[Math.floor(Math.random() * storeNames.length)];
  const productIdx = Math.floor(Math.random() * productNames.length);
  const productName = productNames[productIdx];
  const sku = `${skuPrefixes[productIdx]}-${String(10000 + Math.floor(Math.random() * 90000)).slice(0, 5)}`;
  const flowType = flowTypes[Math.floor(Math.random() * flowTypes.length)];
  const quantity = flowType === "PURCHASE_IN"
    ? 10 + Math.floor(Math.random() * 90)
    : 1 + Math.floor(Math.random() * 20);
  const isAbnormal = Math.random() < 0.15;
  const status = isAbnormal ? "ABNORMAL" : statuses[Math.floor(Math.random() * 2)];

  const now = new Date();
  now.setMinutes(now.getMinutes() - id * 45);

  return {
    id,
    storeName,
    flowNo: `FL-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(100000 + id).slice(1)}`,
    flowType,
    productName,
    sku,
    quantity,
    operator: operators[Math.floor(Math.random() * operators.length)],
    status,
    remark: isAbnormal ? "数量异常，待核查" : (Math.random() < 0.3 ? "常规操作" : null),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export const mockFlows = Array.from({ length: 120 }, (_, i) => generateFlow(i + 1));

export function getFlowsByStore(storeName?: string, flowType?: string, page = 1, pageSize = 30) {
  let filtered = [...mockFlows];

  if (storeName && storeName !== "all") {
    filtered = filtered.filter(f => f.storeName === storeName);
  }
  if (flowType && flowType !== "all") {
    filtered = filtered.filter(f => f.flowType === flowType);
  }

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return { items, total, page, pageSize };
}

export function getStoreList() {
  return [...storeNames];
}

export function updateFlowStatus(id: number, status: string) {
  const flow = mockFlows.find(f => f.id === id);
  if (flow) {
    flow.status = status;
    flow.updatedAt = new Date().toISOString();
  }
  return flow;
}
