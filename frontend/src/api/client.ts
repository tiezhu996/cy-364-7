import { API_BASE_URL } from "../constants/app";
import type { OverviewResponse, InventoryFlowResponse, FlowType, FlowStatus, OperationRecord } from "../types";

export async function fetchOverview(): Promise<OverviewResponse> {
  const response = await fetch(`${API_BASE_URL}/overview`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Overview request failed: ${response.status}`);
  }

  return response.json() as Promise<OverviewResponse>;
}

export async function fetchInventoryFlows(
  storeName?: string,
  flowType?: FlowType | "all",
  page = 1,
  pageSize = 30,
): Promise<InventoryFlowResponse> {
  const params = new URLSearchParams();
  if (storeName) params.set("storeName", storeName);
  if (flowType && flowType !== "all") params.set("flowType", flowType);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));

  const response = await fetch(`${API_BASE_URL}/inventory/flows?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Inventory flows request failed: ${response.status}`);
  }

  return response.json() as Promise<InventoryFlowResponse>;
}

export async function fetchStores(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/inventory/stores`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Stores request failed: ${response.status}`);
  }

  return response.json() as Promise<string[]>;
}

export async function updateFlowStatus(id: number, status: FlowStatus): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/inventory/flows/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Update flow status failed: ${response.status}`);
  }
}

export async function fetchInventoryOperations(): Promise<OperationRecord[]> {
  const response = await fetch(`${API_BASE_URL}/inventory/operations`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Inventory operations request failed: ${response.status}`);
  }

  return response.json() as Promise<OperationRecord[]>;
}
