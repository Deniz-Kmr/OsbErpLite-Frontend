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
  ProductDto,
  CreateProductRequest,
  UpdateProductRequest,
} from '@core/models/dto/product.dto';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'products';

  private productsSubject = new BehaviorSubject<ProductDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  products$ = this.productsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  pagination$ = this.paginationSubject.asObservable();

  loadProducts(params?: QueryParams): void {
    this.loadingSubject.next(true);
    this.api
      .get<PaginatedList<ProductDto>>(this.endpoint, params)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.productsSubject.next(res.data.items);
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

  getById(id: string): Observable<ApiResponse<ProductDto>> {
    return this.api.get<ProductDto>(`${this.endpoint}/${id}`);
  }

  create(
    data: CreateProductRequest,
  ): Observable<ApiResponse<ProductDto>> {
    return this.api.post<ProductDto>(this.endpoint, data);
  }

  update(
    id: string,
    data: UpdateProductRequest,
  ): Observable<ApiResponse<ProductDto>> {
    return this.api.put<ProductDto>(`${this.endpoint}/${id}`, data);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
