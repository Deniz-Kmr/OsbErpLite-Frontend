export interface PositionDto {
  id: string;
  title: string;
  level: number;
  createdDate: string;
}

export interface CreatePositionRequest {
  title: string;
  level: number;
}

export interface UpdatePositionRequest {
  title: string;
  level: number;
}
