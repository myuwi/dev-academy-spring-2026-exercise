CREATE TABLE "electricitydata" (
	"id" bigint PRIMARY KEY NOT NULL,
	"date" date,
	"starttime" timestamp,
	"productionamount" numeric(11, 5),
	"consumptionamount" numeric(11, 3),
	"hourlyprice" numeric(6, 3)
);
