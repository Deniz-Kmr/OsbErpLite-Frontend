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
  DepartmentDto,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '@core/models/dto/department.dto';
import { EmployeeDto } from '@core/models/dto/employee.dto';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'departments';

  private departmentsSubject = new BehaviorSubject<DepartmentDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  departments$ = this.departmentsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  pagination$ = this.paginationSubject.asObservable();

  loadDepartments(params?: QueryParams): void {
    this.loadingSubject.next(true);
    this.api
      .get<PaginatedList<DepartmentDto>>(this.endpoint, params)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.departmentsSubject.next(res.data.items);
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

  getAll(): Observable<ApiResponse<PaginatedList<DepartmentDto>>> {
    return this.api.get<PaginatedList<DepartmentDto>>(this.endpoint, {
      pageNumber: 1,
      pageSize: 1000,
    });
  }

  getById(id: string): Observable<ApiResponse<DepartmentDto>> {
    return this.api.get<DepartmentDto>(`${this.endpoint}/${id}`);
  }

  create(
    data: CreateDepartmentRequest,
  ): Observable<ApiResponse<DepartmentDto>> {
    return this.api.post<DepartmentDto>(this.endpoint, data);
  }

  update(
    id: string,
    data: UpdateDepartmentRequest,
  ): Observable<ApiResponse<DepartmentDto>> {
    return this.api.put<DepartmentDto>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getEmployees(): Observable<ApiResponse<PaginatedList<EmployeeDto>>> {
    return this.api.get<PaginatedList<EmployeeDto>>('employees', {
      pageNumber: 1,
      pageSize: 1000,
    });
  }
}
