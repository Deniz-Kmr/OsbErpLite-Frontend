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
  LeaveRequestDto,
  CreateLeaveRequestRequest,
} from '@core/models/dto/leave-request.dto';
import { LeaveRequestStatus } from '@core/models/enums';

@Injectable({ providedIn: 'root' })
export class LeaveRequestService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'leave-requests';

  private requestsSubject = new BehaviorSubject<LeaveRequestDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  requests$ = this.requestsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  pagination$ = this.paginationSubject.asObservable();

  loadRequests(params?: QueryParams): void {
    this.loadingSubject.next(true);
    this.api
      .get<PaginatedList<LeaveRequestDto>>(this.endpoint, params)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.requestsSubject.next(res.data.items);
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

  getById(id: string): Observable<ApiResponse<LeaveRequestDto>> {
    return this.api.get<LeaveRequestDto>(`${this.endpoint}/${id}`);
  }

  create(
    data: CreateLeaveRequestRequest,
  ): Observable<ApiResponse<LeaveRequestDto>> {
    return this.api.post<LeaveRequestDto>(this.endpoint, data);
  }

  updateStatus(
    id: string,
    status: LeaveRequestStatus,
  ): Observable<ApiResponse<LeaveRequestDto>> {
    return this.api.put<LeaveRequestDto>(`${this.endpoint}/${id}/status`, { status });
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
