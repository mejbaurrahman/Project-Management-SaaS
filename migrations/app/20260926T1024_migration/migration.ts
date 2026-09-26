#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/0c0734babd6eeb868fee1f281ca96963022475611560e9f170f465daa35f8599/contract';
import startContract from '../../snapshots/0c0734babd6eeb868fee1f281ca96963022475611560e9f170f465daa35f8599/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/49500c5c0f9968ae56364d302d5d7271864096996e16837ff8e17547eb43c5ad/contract';
import endContract from '../../snapshots/49500c5c0f9968ae56364d302d5d7271864096996e16837ff8e17547eb43c5ad/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'OrganizationRole',
        members: ['OWNER', 'MANAGER', 'MEMBER', 'GUEST'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'PaymentStatus',
        members: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'ProjectStatus',
        members: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'SprintStatus',
        members: ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'TaskPriority',
        members: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'TaskStatus',
        members: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'UserRole',
        members: ['ADMIN', 'MANAGER', 'MEMBER'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'UserStatus',
        members: ['ACTIVE', 'BLOCKED'],
      }),
      this.createTable({
        schema: 'public',
        table: 'Organization',
        columns: [
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('deletedAt', 'timestamp(3)', {
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'OrganizationMember',
        columns: [
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('organizationId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', '"OrganizationRole"', {
            notNull: true,
            default: lit('MEMBER'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'OrganizationRole' } },
          }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('deletedAt', 'timestamp(3)', {
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('profilePhoto', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('role', '"UserRole"', {
            notNull: true,
            default: lit('MEMBER'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'UserRole' } },
          }),
          col('status', '"UserStatus"', {
            notNull: true,
            default: lit('ACTIVE'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'UserStatus' } },
          }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Organization',
        index: 'Organization_deletedAt_idx',
        columns: ['deletedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Organization',
        index: 'Organization_name_idx',
        columns: ['name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'OrganizationMember',
        index: 'OrganizationMember_organizationId_idx',
        columns: ['organizationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'OrganizationMember',
        index: 'OrganizationMember_organizationId_userId_key',
        columns: ['organizationId', 'userId'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'OrganizationMember',
        index: 'OrganizationMember_role_idx',
        columns: ['role'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'OrganizationMember',
        index: 'OrganizationMember_userId_idx',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_deletedAt_idx',
        columns: ['deletedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_email_key',
        columns: ['email'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_role_idx',
        columns: ['role'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_status_idx',
        columns: ['status'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'OrganizationMember',
        foreignKey: {
          name: 'OrganizationMember_organizationId_fkey',
          columns: ['organizationId'],
          references: { schema: 'public', table: 'Organization', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'OrganizationMember',
        foreignKey: {
          name: 'OrganizationMember_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
          onUpdate: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
