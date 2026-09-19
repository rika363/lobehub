ALTER TABLE "project_environments" DROP CONSTRAINT IF EXISTS "project_environments_default_enabled";--> statement-breakpoint
ALTER TABLE "project_environments" DROP CONSTRAINT IF EXISTS "project_environments_default_instance_fk";--> statement-breakpoint
DROP INDEX IF EXISTS "project_environments_default_instance_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "project_environments_project_default_unique";--> statement-breakpoint
ALTER TABLE "project_working_directories" ADD COLUMN IF NOT EXISTS "environment_instance_id" uuid;--> statement-breakpoint
ALTER TABLE "project_working_directories" DROP CONSTRAINT IF EXISTS "project_working_directories_environment_instance_id_environment_instances_id_fk";--> statement-breakpoint
ALTER TABLE "project_working_directories" ADD CONSTRAINT "project_working_directories_environment_instance_id_environment_instances_id_fk" FOREIGN KEY ("environment_instance_id") REFERENCES "public"."environment_instances"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "project_working_directories_project_instance_unique" ON "project_working_directories" USING btree ("project_id","environment_instance_id");--> statement-breakpoint
ALTER TABLE "project_environments" DROP COLUMN IF EXISTS "default_instance_id";--> statement-breakpoint
ALTER TABLE "project_environments" DROP COLUMN IF EXISTS "is_default";
