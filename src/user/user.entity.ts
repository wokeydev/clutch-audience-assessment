import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role';

@Entity()
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'varchar',
    default: Role.USER,
  })
  role: Role;

  @Column({ unique: true, nullable: true })
  referralCode: string | null;

  @Column({ nullable: true })
  referredBy: string;
}

export default User;
