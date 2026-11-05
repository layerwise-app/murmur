CREATE TABLE `site_secrets` (
	`name` text PRIMARY KEY,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `waitlist_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`visitor` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `waitlist_signups` (
	`id` text PRIMARY KEY,
	`email` text NOT NULL UNIQUE,
	`platform` text NOT NULL,
	`listens_to` text NOT NULL,
	`owner_notified` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `waitlist_attempts_visitor_idx` ON `waitlist_attempts` (`visitor`,`created_at`);--> statement-breakpoint
CREATE INDEX `waitlist_signups_created_at_idx` ON `waitlist_signups` (`created_at`);