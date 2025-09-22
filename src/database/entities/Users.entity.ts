import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
    user_id!: string

  @Column('text')
    user_first_name!: string

  @Column('text')
    user_last_name!: string

  @Column('text', { unique: true })
    user_email!: string

  @Column('text')
    user_password!: string

  @CreateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP'
  })
    date_created!: Date

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP'
  })
    date_updated!: Date
}
