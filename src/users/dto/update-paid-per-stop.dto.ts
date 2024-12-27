import { IsNumber, Min } from 'class-validator';

export class UpdatePaidPerStopDto {
  @IsNumber()
  @Min(0)
  paidPerStop: number;
}
