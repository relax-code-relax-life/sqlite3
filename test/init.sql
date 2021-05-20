create table if not exists topic(
    id text primary key not null default( hex(randomblob(8)) ),
    name text not null,
    note text
);

create table if not exists topic2(
    id text,
    name text,
    note text
);