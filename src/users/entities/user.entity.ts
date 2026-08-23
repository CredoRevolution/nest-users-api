import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  login: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  passwordHash: string;

  @Column()
  age: number;

  @Column({ nullable: true, length: 1000, type: 'varchar' })
  about: string;
}
