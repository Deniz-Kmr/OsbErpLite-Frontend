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
  BusinessPartnerDto,
  CreateBusinessPartnerRequest,
  UpdateBusinessPartnerRequest,
} from '@core/models/dto/business-partner.dto';

@Injectable({ providedIn: 'root' })
export class BusinessPartnerService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'business-partners';

  private partnersSubject = new BehaviorSubject<BusinessPartnerDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  partners$ = this.partnersSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  pagination$ = this.paginationSubject.asObservable();

  loadPartners(params?: QueryParams): void {
    this.loadingSubject.next(true);
    this.api
      .get<PaginatedList<BusinessPartnerDto>>(this.endpoint, params)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.partnersSubject.next(res.data.items);
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

  getById(id: string): Observable<ApiResponse<BusinessPartnerDto>> {
    return this.api.get<BusinessPartnerDto>(`${this.endpoint}/${id}`);
  }

  create(
    data: CreateBusinessPartnerRequest,
  ): Observable<ApiResponse<BusinessPartnerDto>> {
    return this.api.post<BusinessPartnerDto>(this.endpoint, data);
  }

  update(
    id: string,
    data: UpdateBusinessPartnerRequest,
  ): Observable<ApiResponse<BusinessPartnerDto>> {
    return this.api.put<BusinessPartnerDto>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
