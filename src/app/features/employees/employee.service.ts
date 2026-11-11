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
  EmployeeDto,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from '@core/models/dto/employee.dto';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'Employees';

  private employeesSubject = new BehaviorSubject<EmployeeDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  employees$ = this.employeesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  pagination$ = this.paginationSubject.asObservable();

  loadEmployees(params?: QueryParams): void {
    this.loadingSubject.next(true);
    this.api
      .get<PaginatedList<EmployeeDto>>(this.endpoint, params)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.employeesSubject.next(res.data.items);
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

  getAll(): Observable<ApiResponse<PaginatedList<EmployeeDto>>> {
    return this.api.get<PaginatedList<EmployeeDto>>(this.endpoint, {
      pageNumber: 1,
      pageSize: 1000,
    });
  }

  getById(id: string): Observable<ApiResponse<EmployeeDto>> {
    return this.api.get<EmployeeDto>(`${this.endpoint}/${id}`);
  }

  create(
    data: CreateEmployeeRequest,
  ): Observable<ApiResponse<EmployeeDto>> {
    return this.api.post<EmployeeDto>(this.endpoint, data);
  }

  update(
    id: string,
    data: UpdateEmployeeRequest,
  ): Observable<ApiResponse<EmployeeDto>> {
    return this.api.put<EmployeeDto>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
