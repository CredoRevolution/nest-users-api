import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { FindActiveUsersDto } from './find-active-users.dto';

@ValidatorConstraint({ name: 'ageRange' })
export class AgeRangeValidator implements ValidatorConstraintInterface {
  validate(maxAge: number, args: ValidationArguments): boolean {
    const { minAge } = args.object as FindActiveUsersDto;
    if (Number.isInteger(maxAge) || Number.isInteger(minAge)) return true;
    return maxAge >= minAge;
  }

  defaultMessage(): string {
    return 'maxAge must be greater than or equal to minAge';
  }
}
