<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchOverview, fetchInventoryOperations } from "./api/client";
import { APP_CODE, APP_NAME } from "./constants/app";
import { REQUEST_MESSAGES } from "./constants/messages";
import { createFallbackOverview } from "./state/dashboard";
import type { OverviewResponse, OperationRecord } from "./types";
import FeatureStrip from "./components/FeatureStrip.vue";
import MetricGrid from "./components/MetricGrid.vue";
import OperationsTable from "./components/OperationsTable.vue";
import StoreFlowTable from "./components/StoreFlowTable.vue";

const overview = ref<OverviewResponse>(createFallbackOverview());
const notice = ref(REQUEST_MESSAGES.overviewFallback);
const invOperations = ref<OperationRecord[]>([]);

function goHealth() {
  window.location.href = REQUEST_MESSAGES.healthPath;
}

function handleOperationsUpdate(records: OperationRecord[]) {
  invOperations.value = records;
  overview.value.records = [...records, ...overview.value.records.filter(r => !r.key.startsWith("inv-"))];
}

async function loadInventoryOperations() {
  try {
    const records = await fetchInventoryOperations();
    invOperations.value = records;
    overview.value.records = [...records, ...overview.value.records.filter(r => !r.key.startsWith("inv-"))];
  } catch {
    // 静默失败
  }
}

onMounted(async () => {
  try {
    overview.value = await fetchOverview();
    notice.value = "后端服务已联通，当前展示实时接口数据。";
    await loadInventoryOperations();
  } catch {
    notice.value = REQUEST_MESSAGES.overviewFallback;
  }
});
</script>

<template>
  <main class="app-shell">
    <header class="topbar">
      <div>
        <span class="brand-code">{{ APP_CODE }}</span>
        <h1 class="brand-title">{{ APP_NAME }}</h1>
      </div>
      <el-button type="primary" @click="goHealth">API Health</el-button>
    </header>
    <section class="workspace">
      <div class="lead-grid">
        <article class="hero-panel">
          <span class="pill">{{ notice }}</span>
          <h2>{{ overview.appName }}</h2>
          <p>{{ overview.description }}</p>
        </article>
        <MetricGrid :items="overview.kpis" />
      </div>
      <FeatureStrip :items="overview.features" />
      <section class="work-panel">
        <h2>门店出入库流水</h2>
        <StoreFlowTable @operations-update="handleOperationsUpdate" />
      </section>
      <section class="work-panel">
        <h2>运营任务流</h2>
        <OperationsTable :records="overview.records" />
      </section>
    </section>
  </main>
</template>
