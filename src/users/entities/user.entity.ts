import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  login: string;

  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Column()
  @Exclude()
  passwordHash: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ default: 0 })
  tokenVersion: number;

  @Index()
  @Column()
  age: number;

  @ApiProperty({ type: String, nullable: true })
  @Column({ nullable: true, length: 1000, type: 'varchar' })
  about: string;

  @ApiHideProperty()
  @Exclude()
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;
}
