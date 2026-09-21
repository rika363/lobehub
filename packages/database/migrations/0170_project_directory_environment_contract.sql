-- Requires scripts/backfillProjectWorkingDirectoryInstances.ts --apply to have completed:
-- the SET NOT NULL below fails loudly when a legacy row was missed.
ALTER TABLE "project_working_directories" DROP CONSTRAINT IF EXISTS "project_working_directories_path_not_empty";--> statement-breakpoint
ALTER TABLE "project_working_directories" DROP CONSTRAINT IF EXISTS "project_working_directories_device_id_devices_id_fk";--> statement-breakpoint
DROP INDEX IF EXISTS "project_working_directories_project_device_path_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "project_working_directories_device_id_idx";--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_working_directories'
      AND column_name = 'environment_instance_id'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "project_working_directories" ALTER COLUMN "environment_instance_id" SET NOT NULL;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "project_working_directories" DROP COLUMN IF EXISTS "device_id";--> statement-breakpoint
ALTER TABLE "project_working_directories" DROP COLUMN IF EXISTS "path";
