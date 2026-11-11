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
  WarehouseDto,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from '@core/models/dto/warehouse.dto';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'Warehouses';

  private warehousesSubject = new BehaviorSubject<WarehouseDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  warehouses$ = this.warehousesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  pagination$ = this.paginationSubject.asObservable();

  loadWarehouses(params?: QueryParams): void {
    this.loadingSubject.next(true);
    this.api
      .get<PaginatedList<WarehouseDto>>(this.endpoint, params)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.warehousesSubject.next(res.data.items);
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

  getAll(): Observable<ApiResponse<PaginatedList<WarehouseDto>>> {
    return this.api.get<PaginatedList<WarehouseDto>>(this.endpoint, {
      pageNumber: 1,
      pageSize: 1000,
    });
  }

  getById(id: string): Observable<ApiResponse<WarehouseDto>> {
    return this.api.get<WarehouseDto>(`${this.endpoint}/${id}`);
  }

  create(
    data: CreateWarehouseRequest,
  ): Observable<ApiResponse<WarehouseDto>> {
    return this.api.post<WarehouseDto>(this.endpoint, data);
  }

  update(
    id: string,
    data: UpdateWarehouseRequest,
  ): Observable<ApiResponse<WarehouseDto>> {
    return this.api.put<WarehouseDto>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
