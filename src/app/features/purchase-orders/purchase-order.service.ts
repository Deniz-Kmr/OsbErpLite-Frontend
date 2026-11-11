import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, finalize } from 'rxjs';

import { ApiService } from '@core/services/api.service';
import { ApiResponse } from '@core/models/api-response.model';
import {
  PaginatedList,
  PaginationMeta,
  QueryParams,
} from '@core/models/paginated-list.model';
import {
  PurchaseOrderDto,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
} from '@core/models/dto/purchase-order.dto';
import { OrderStatus } from '@core/models/enums';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'PurchaseOrders';

  private ordersSubject = new BehaviorSubject<PurchaseOrderDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  orders$ = this.ordersSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  pagination$ = this.paginationSubject.asObservable();

  loadOrders(params?: QueryParams): void {
    this.loadingSubject.next(true);
    this.api
      .get<PaginatedList<PurchaseOrderDto>>(this.endpoint, params)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.ordersSubject.next(res.data.items);
            this.paginationSubject.next({
              page: res.data.page,
              pageSize: res.data.pageSize,
              totalCount: res.data.totalCount,
              totalPages: res.data.totalPages,
              hasPreviousPage: res.data.hasPreviousPage,
              hasNextPage: res.data.hasNextPage,
            });
          }
        },
      });
  }

  getById(id: string): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.api.get<PurchaseOrderDto>(`${this.endpoint}/${id}`);
  }

  create(
    data: CreatePurchaseOrderRequest,
  ): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.api.post<PurchaseOrderDto>(this.endpoint, data);
  }

  update(
    id: string,
    data: UpdatePurchaseOrderRequest,
  ): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.api.put<PurchaseOrderDto>(`${this.endpoint}/${id}`, data);
  }

  updateStatus(
    id: string,
    status: OrderStatus,
  ): Observable<ApiResponse<PurchaseOrderDto>> {
    return this.api.put<PurchaseOrderDto>(
      `${this.endpoint}/${id}/status`,
      { status },
    );
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
