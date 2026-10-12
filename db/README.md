# Dog database

A DuckDB database that gathers research datasets about dogs.
`schema.sql` defines it; `npm run db:create` builds an empty database at `data/dogs.duckdb`, which is not committed.

## Tables

| Table   | Holds                                                        | Natural key                  |
| ------- | ------------------------------------------------------------ | ---------------------------- |
| `breed` | Every breed in the FCI breeds nomenclature                   | `fci_number`                 |
| `dog`   | One row per dog that any research dataset has a datapoint on | `dataset`, `dataset_dog_key` |

## breed

- The source is the [FCI breeds nomenclature](https://www.fci.be/en/Nomenclature/), the international list kept by the Fédération Cynologique Internationale.
  It offers no bulk download, so each row comes from the breed's page, recorded in `source_url`.
- `breed` is the English display name; `fci_name` is the name exactly as the FCI writes it.
- `recognition` is `definitive` or `provisional`; `recognised_on` is the date of that recognition.
- Breeds recognised only by national kennel clubs, such as the AKC or The Kennel Club, are not in the FCI list and so not in this table.

## dog

- `dataset` identifies the research dataset the dog comes from; `dataset_dog_key` is the dog's identifier within it.
- The same animal in two datasets is two rows, since datasets share no dog identifiers.
- `dog` is the dog's name where the dataset gives one, otherwise empty.
- `breed_id` is `NULL` when the dataset records no single FCI breed: a mixed-breed dog, an unknown breed, or a breed outside the FCI list.
