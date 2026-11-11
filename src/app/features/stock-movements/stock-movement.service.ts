import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, finalize } from 'rxjs';

import { ApiService } from '@core/services/api.service';
import {
  PaginatedList,
  PaginationMeta,
  QueryParams,
} from '@core/models/paginated-list.model';
import { StockMovementDto } from '@core/models/dto/stock-movement.dto';

@Injectable({ providedIn: 'root' })
export class StockMovementService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'StockMovements';

  private movementsSubject = new BehaviorSubject<StockMovementDto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private paginationSubject = new BehaviorSubject<PaginationMeta | null>(null);

  movements$ = this.movementsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  pagination$ = this.paginationSubject.asObservable();

  loadMovements(params?: QueryParams): void {
    this.loadingSubject.next(true);
    this.api
      .get<PaginatedList<StockMovementDto>>(this.endpoint, params)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.movementsSubject.next(res.data.items);
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
}
