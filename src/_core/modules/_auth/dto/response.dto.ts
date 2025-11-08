import { ApiProperty } from '@nestjs/swagger';

export namespace AuthResponseDto {
  export class RegisterResponseDto {
    @ApiProperty({
      example: {
        email: 'example@gmail.com',
        other_fields: '...',
      },
      nullable: true,
    })
    data!: object;

    @ApiProperty({
      example: 'Success',
    })
    message!: string;

    @ApiProperty({
      example: 201,
    })
    statusCode!: number;
  }
  export class LoginResponseDto {
    @ApiProperty({
      example: 'JWT Token',
    })
    data!: string;

    @ApiProperty({
      example: 'Success',
    })
    message!: string;

    @ApiProperty({
      example: 200,
    })
    statusCode!: number;
  }

}
