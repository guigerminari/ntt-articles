import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Permission } from '../../permissions/entities/permission.entity';
import { Article } from '../../articles/entities/article.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @ManyToOne(() => Permission, (permission) => permission.users)
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;

  @Column()
  permissionId: string;

  @OneToMany(() => Article, (article) => article.creator)
  articles: Article[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
