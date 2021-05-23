create table if not exists Users (
    id int not null auto_increment primary key,
    email varchar(320) not null unique,
    pass_hash varchar(255) not null,
    usr_name varchar(255) not null unique,
    first_name varchar(128) not null,
    last_name varchar(128) not null,
    photo_url varchar(2000) not null,
  	unique index idx_usr_name_email (usr_name, email)
);

create table if not exists UserLog (
    id int not null auto_increment primary key,
    usr_id int not null,
    signin_dt datetime not null,
    client_IP varchar(45)
);