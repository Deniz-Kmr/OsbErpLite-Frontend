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
  SalesOrderDto,
  CreateSalesOrderRequest,
  UpdateSalesOrderRequest,
} from '@core/models/dto/sales-order.dto';
import { OrderStatus } from '@core/models/enums';

@Injectable({ providedIn: 'root' })
export class SalesOrderService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'sales-orders';

  private ordersSubject = new BehaviorSubject<SalesOrderDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  orders$ = this.ordersSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  pagination$ = this.paginationSubject.asObservable();

  loadOrders(params?: QueryParams): void {
    this.loadingSubject.next(true);
    this.api
      .get<PaginatedList<SalesOrderDto>>(this.endpoint, params)
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

  getById(id: string): Observable<ApiResponse<SalesOrderDto>> {
    return this.api.get<SalesOrderDto>(`${this.endpoint}/${id}`);
  }

  create(
    data: CreateSalesOrderRequest,
  ): Observable<ApiResponse<SalesOrderDto>> {
    return this.api.post<SalesOrderDto>(this.endpoint, data);
  }

  update(
    id: string,
    data: UpdateSalesOrderRequest,
  ): Observable<ApiResponse<SalesOrderDto>> {
    return this.api.put<SalesOrderDto>(`${this.endpoint}/${id}`, data);
  }

  updateStatus(
    id: string,
    status: OrderStatus,
  ): Observable<ApiResponse<SalesOrderDto>> {
    return this.api.put<SalesOrderDto>(
      `${this.endpoint}/${id}/status`,
      { status },
    );
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
