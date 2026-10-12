CREATE SEQUENCE breed_id_sequence START 1;

CREATE TABLE breed (
    breed_id              BIGINT NOT NULL PRIMARY KEY DEFAULT nextval('breed_id_sequence'),
    breed                 TEXT   NOT NULL,
    fci_number            BIGINT NOT NULL,
    fci_name              TEXT   NOT NULL,
    fci_group             BIGINT NOT NULL CHECK (fci_group BETWEEN 1 AND 10),
    fci_group_name        TEXT   NOT NULL,
    fci_section           TEXT   NOT NULL DEFAULT '',
    country_of_origin     TEXT   NOT NULL,
    recognition           TEXT   NOT NULL CHECK (recognition IN ('definitive', 'provisional')),
    recognised_on         DATE   NOT NULL,
    standard_published_on DATE   NOT NULL,
    source_url            TEXT   NOT NULL
);

CREATE UNIQUE INDEX breed_fci_number ON breed (fci_number);

CREATE SEQUENCE dog_id_sequence START 1;

CREATE TABLE dog (
    dog_id          BIGINT NOT NULL PRIMARY KEY DEFAULT nextval('dog_id_sequence'),
    dog             TEXT   NOT NULL DEFAULT '',
    dataset         TEXT   NOT NULL,
    dataset_dog_key TEXT   NOT NULL,
    breed_id        BIGINT REFERENCES breed (breed_id)
);

CREATE UNIQUE INDEX dog_dataset_dog_key ON dog (dataset, dataset_dog_key);
