<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { fetchInventoryFlows, fetchStores, updateFlowStatus, fetchInventoryOperations } from "../api/client";
import type { InventoryFlow, FlowType, FlowStatus, OperationRecord } from "../types";

const emit = defineEmits<{
  (e: "operationsUpdate", records: OperationRecord[]): void;
}>();

const stores = ref<string[]>([]);
const selectedStore = ref<string>("all");
const selectedType = ref<FlowType | "all">("all");
const flows = ref<InventoryFlow[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(30);
const loading = ref(false);

const flowTypeOptions = [
  { label: "全部", value: "all" },
  { label: "采购入库", value: "PURCHASE_IN" },
  { label: "销售出库", value: "SALE_OUT" },
];

const statusOptions = [
  { label: "正常", value: "NORMAL", type: "success" },
  { label: "异常", value: "ABNORMAL", type: "danger" },
  { label: "待处理", value: "PENDING", type: "warning" },
];

const typeMap: Record<FlowType, { label: string; type: string }> = {
  PURCHASE_IN: { label: "采购入库", type: "success" },
  SALE_OUT: { label: "销售出库", type: "primary" },
};

const statusMap: Record<FlowStatus, { label: string; type: string }> = {
  NORMAL: { label: "正常", type: "success" },
  ABNORMAL: { label: "异常", type: "danger" },
  PENDING: { label: "待处理", type: "warning" },
};

const formattedDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const loadFlows = async () => {
  loading.value = true;
  try {
    const response = await fetchInventoryFlows(
      selectedStore.value === "all" ? undefined : selectedStore.value,
      selectedType.value,
      currentPage.value,
      pageSize.value,
    );
    flows.value = response.items;
    total.value = response.total;
  } catch {
    ElMessage.error("加载流水数据失败");
  } finally {
    loading.value = false;
  }
};

const loadStores = async () => {
  try {
    stores.value = await fetchStores();
  } catch {
    ElMessage.error("加载门店列表失败");
  }
};

const refreshOperations = async () => {
  try {
    const records = await fetchInventoryOperations();
    emit("operationsUpdate", records);
  } catch {
    // 静默失败
  }
};

const handleStatusChange = async (row: InventoryFlow, status: FlowStatus) => {
  try {
    await updateFlowStatus(row.id, status);
    row.status = status;
    ElMessage.success("状态更新成功");
    await refreshOperations();
  } catch {
    ElMessage.error("状态更新失败");
  }
};

const handleFilterChange = () => {
  currentPage.value = 1;
  loadFlows();
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadFlows();
};

onMounted(() => {
  loadStores();
  loadFlows();
});

watch([selectedStore, selectedType], () => {
  handleFilterChange();
});

const storeOptions = computed(() => [
  { label: "全部门店", value: "all" },
  ...stores.value.map(s => ({ label: s, value: s })),
]);
</script>

<template>
  <div class="flow-panel">
    <div class="flow-filter-bar">
      <div class="filter-group">
        <el-select
        v-model="selectedStore"
        placeholder="选择门店"
        class="filter-select"
        size="large"
        @change="handleFilterChange"
      >
        <el-option
          v-for="opt in storeOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <el-select
        v-model="selectedType"
        placeholder="出入库类型"
        class="filter-select"
        size="large"
        @change="handleFilterChange"
      >
        <el-option
          v-for="opt in flowTypeOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>
    <el-button type="primary" size="large" @click="loadFlows" :loading="loading">
      刷新
    </el-button>
  </div>
  <div class="plain-table" v-loading="loading">
    <div class="plain-row plain-head">
      <span>门店</span>
      <span>单号</span>
      <span>类型</span>
      <span>商品</span>
      <span>SKU</span>
      <span>数量</span>
      <span>操作人</span>
      <span>状态</span>
      <span>时间</span>
      <span>操作</span>
    </div>
    <div
      v-for="item in flows"
      :key="item.id"
      class="plain-row"
      :class="{ 'row-abnormal': item.status === 'ABNORMAL' }"
    >
      <span>{{ item.storeName }}</span>
      <span class="flow-no">{{ item.flowNo }}</span>
      <span>
        <el-tag :type="typeMap[item.flowType].type" size="small">
          {{ typeMap[item.flowType].label }}
        </el-tag>
      </span>
      <span>{{ item.productName }}</span>
      <span class="sku-text">{{ item.sku }}</span>
      <span :class="{ 'quantity-abnormal': item.status === 'ABNORMAL' }">
        {{ item.quantity }}
      </span>
      <span>{{ item.operator }}</span>
      <span>
        <el-tag :type="statusMap[item.status].type" size="small">
          {{ statusMap[item.status].label }}
        </el-tag>
      </span>
      <span class="date-text">{{ formattedDate(item.createdAt) }}</span>
      <span class="action-cell">
        <el-dropdown trigger="click" @command="(val: FlowStatus) => handleStatusChange(item, val)">
          <el-button link type="primary" size="small">
            处理
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
              v-for="opt in statusOptions"
              :key="opt.value"
              :command="opt.value"
              :disabled="item.status === opt.value"
            >
              标记为{{ opt.label }}
            </el-dropdown-item>
          </template>
        </el-dropdown>
      </span>
    </div>
  </div>
  <div class="pagination-wrap">
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next, jumper"
      @current-change="handlePageChange"
    />
  </div>
</template>

<style scoped>
.flow-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  min-width: 180px;
}

.plain-row {
  display: grid;
  grid-template-columns: minmax(100px, 1fr) minmax(160px, 1.2fr) minmax(90px, 0.8fr) minmax(140px, 1.2fr) minmax(120px, 1fr) minmax(70px, 0.6fr) minmax(80px, 0.7fr) minmax(80px, 0.7fr) minmax(140px, 1.1fr) minmax(80px, 0.7fr);
  gap: 12px;
  padding: 13px 14px;
  border-top: 1px solid color-mix(in srgb, #1f2417 10%, transparent);
  align-items: center;
}

.row-abnormal {
  background: color-mix(in srgb, #b55239 6%, transparent);
}

.flow-no {
  font-family: "SF Mono", Monaco, Consolas, monospace;
  font-size: 13px;
  color: color-mix(in srgb, #1f2417 78%, #7d8f2d 22%);
}

.sku-text {
  font-family: "SF Mono", Monaco, Consolas, monospace;
  font-size: 12px;
  color: color-mix(in srgb, #1f2417 64%, #7d8f2d 36%);
}

.quantity-abnormal {
  color: #b55239;
  font-weight: 700;
}

.date-text {
  font-size: 13px;
  color: color-mix(in srgb, #1f2417 68%, transparent);
}

.action-cell {
  display: flex;
  align-items: center;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

@media (max-width: 1024px) {
  .plain-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
