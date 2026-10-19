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
  PositionDto,
  CreatePositionRequest,
  UpdatePositionRequest,
} from '@core/models/dto/position.dto';

@Injectable({ providedIn: 'root' })
export class PositionService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'positions';

  private positionsSubject = new BehaviorSubject<PositionDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  positions$ = this.positionsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  pagination$ = this.paginationSubject.asObservable();

  loadPositions(params?: QueryParams): void {
    this.loadingSubject.next(true);
    this.api
      .get<PaginatedList<PositionDto>>(this.endpoint, params)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.positionsSubject.next(res.data.items);
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

  getAll(): Observable<ApiResponse<PaginatedList<PositionDto>>> {
    return this.api.get<PaginatedList<PositionDto>>(this.endpoint, {
      pageNumber: 1,
      pageSize: 1000,
    });
  }

  getById(id: string): Observable<ApiResponse<PositionDto>> {
    return this.api.get<PositionDto>(`${this.endpoint}/${id}`);
  }

  create(
    data: CreatePositionRequest,
  ): Observable<ApiResponse<PositionDto>> {
    return this.api.post<PositionDto>(this.endpoint, data);
  }

  update(
    id: string,
    data: UpdatePositionRequest,
  ): Observable<ApiResponse<PositionDto>> {
    return this.api.put<PositionDto>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
