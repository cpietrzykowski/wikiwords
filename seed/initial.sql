CREATE TABLE IF NOT EXISTS "class"
(
    "id" INTEGER NOT NULL,
    "class" TEXT NOT NULL UNIQUE,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "language"
(
    "id" INTEGER NOT NULL,
    "language" TEXT NOT NULL UNIQUE,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "word"
(
    "id" INTEGER NOT NULL,
    "word" TEXT NOT NULL UNIQUE,
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "revision"
(
    "id" INTEGER NOT NULL,
    "time" TEXT,
    "text" TEXT,
    "format" TEXT,
    "wordid" INTEGER NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("wordid") REFERENCES word ("id")
);

CREATE TABLE IF NOT EXISTS "revisions_languages"
(
    "id" INTEGER NOT NULL,
    "revisionid" INTEGER NOT NULL,
    "languageid" INTEGER NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("revisionid") REFERENCES revision ("id"),
    FOREIGN KEY ("languageid") REFERENCES language ("id")
);

CREATE TABLE IF NOT EXISTS "revisions_languages_classes"
(
    "revlangid" INTEGER NOT NULL,
    "classid" INTEGER NOT NULL,
    FOREIGN KEY ("revlangid") REFERENCES revisions_languages ("id"),
    FOREIGN KEY ("classid") REFERENCES class ("id")
);
