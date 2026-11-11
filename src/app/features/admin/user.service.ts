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
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
  ResetPasswordRequest,
} from '@core/models/dto/user.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'users';

  private usersSubject = new BehaviorSubject<UserDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  users$ = this.usersSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  pagination$ = this.paginationSubject.asObservable();

  loadUsers(params?: QueryParams): void {
    this.loadingSubject.next(true);
    this.api
      .get<PaginatedList<UserDto>>(this.endpoint, params)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.usersSubject.next(res.data.items);
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

  getById(id: string): Observable<ApiResponse<UserDto>> {
    return this.api.get<UserDto>(`${this.endpoint}/${id}`);
  }

  create(data: CreateUserRequest): Observable<ApiResponse<UserDto>> {
    return this.api.post<UserDto>(this.endpoint, data);
  }

  update(id: string, data: UpdateUserRequest): Observable<ApiResponse<UserDto>> {
    return this.api.put<UserDto>(`${this.endpoint}/${id}`, data);
  }

  resetPassword(id: string, data: ResetPasswordRequest): Observable<ApiResponse<void>> {
    return this.api.post<void>(`${this.endpoint}/${id}/reset-password`, data);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  triggerSapSync(): Observable<ApiResponse<void>> {
    return this.api.post<void>('sap/sync-business-partners', {});
  }
}
