import { Controller, Get, Query, Put, Param, Body } from "@nestjs/common";
import { InventoryService } from "./inventory.service";

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get("api/inventory/flows")
  getFlows(
    @Query("storeName") storeName?: string,
    @Query("flowType") flowType?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    return this.inventoryService.getFlows(
      storeName,
      flowType,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get("inventory/flows")
  getFlowsWeb(
    @Query("storeName") storeName?: string,
    @Query("flowType") flowType?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    return this.inventoryService.getFlows(
      storeName,
      flowType,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get("api/inventory/stores")
  getStores() {
    return this.inventoryService.getStores();
  }

  @Get("inventory/stores")
  getStoresWeb() {
    return this.inventoryService.getStores();
  }

  @Put("api/inventory/flows/:id/status")
  updateStatus(@Param("id") id: string, @Body("status") status: string) {
    return this.inventoryService.updateStatus(parseInt(id, 10), status);
  }

  @Put("inventory/flows/:id/status")
  updateStatusWeb(@Param("id") id: string, @Body("status") status: string) {
    return this.inventoryService.updateStatus(parseInt(id, 10), status);
  }

  @Get("api/inventory/operations")
  getOperations() {
    return this.inventoryService.getOperationRecords();
  }

  @Get("inventory/operations")
  getOperationsWeb() {
    return this.inventoryService.getOperationRecords();
  }
}
