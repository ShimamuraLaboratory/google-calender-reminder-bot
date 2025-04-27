PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`calendar_id` text,
	`event_id` text,
	`title` text NOT NULL,
	`distribution` text NOT NULL,
	`start_at` text NOT NULL,
	`end_at` text NOT NULL,
	`remind_days` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
INSERT INTO `__new_schedules`("id", "calendar_id", "event_id", "title", "distribution", "start_at", "end_at", "remind_days", "created_at", "updated_at", "deleted_at") SELECT "id", "calendar_id", "event_id", "title", "distribution", "start_at", "end_at", "remind_days", "created_at", "updated_at", "deleted_at" FROM `schedules`;--> statement-breakpoint
DROP TABLE `schedules`;--> statement-breakpoint
ALTER TABLE `__new_schedules` RENAME TO `schedules`;--> statement-breakpoint
PRAGMA foreign_keys=ON;