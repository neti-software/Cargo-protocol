import { DEFAULT_ADDRESS } from '@constant/common';
import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'IsAddress' })
@Injectable()
export class IsAddressRule implements ValidatorConstraintInterface {
  private readonly AddressRegex = new RegExp(/0x[a-f0-9]{40}$/);

  validate(value: string): boolean {
    return this.AddressRegex.test(value);
  }

  defaultMessage(): string {
    return `Address has to match pattern ${DEFAULT_ADDRESS} in lowercase letters`;
  }
}
