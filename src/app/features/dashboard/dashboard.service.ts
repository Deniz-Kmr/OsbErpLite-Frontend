import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core/services/api.service';
import { ApiResponse } from '@core/models/api-response.model';
import {
  DashboardSummaryDto,
  MonthlyStockMovementDto,
  DepartmentDistributionDto,
} from '@core/models/dto/dashboard.dto';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  getSummary(): Observable<ApiResponse<DashboardSummaryDto>> {
    return this.api.get<DashboardSummaryDto>('dashboard/summary');
  }

  getStockMovements(): Observable<ApiResponse<MonthlyStockMovementDto[]>> {
    return this.api.get<MonthlyStockMovementDto[]>('dashboard/stock-movements');
  }

  getDepartmentDistribution(): Observable<ApiResponse<DepartmentDistributionDto[]>> {
    return this.api.get<DepartmentDistributionDto[]>('dashboard/department-distribution');
  }
}
