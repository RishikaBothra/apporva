CREATE TYPE "public"."role" AS ENUM('employee', 'manager', 'admin');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";