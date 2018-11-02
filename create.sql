drop table if exists post;
drop table if exists conversation;
drop table if exists lending;
drop table if exists item_review;
drop table if exists photo;
drop table if exists item;
drop table if exists users;
drop type if exists item_type;
drop type if exists lending_status;


create table users(
	rollno varchar(10) primary key,
	name varchar(48),
	dp varchar(256),
	address1 varchar(256),
	address2 varchar(256)
);



create type item_type as enum ('Book', 'Electronics', 'Musical Instrument', 'Sports Equipment');
-- alter type item_type add value 'Value';
-- select enum_range(enum_first(null::item_type),null::item_type);
create table item(
    item_id serial primary key,
    name varchar(32),
  	type item_type,
    owner_id varchar(10) references users(rollno),
    description varchar(256),
    available boolean
);



create table photo(
	item_id integer references item(item_id),
	photo varchar(256),
	primary key(item_id, photo)
);



create table item_review(
	item_id integer references item(item_id),
	user_id varchar(10) references users(rollno),
	stars integer check (stars >= 0 and stars <= 5),
	title varchar(64),
	content varchar(512),
	primary key(item_id, user_id)
);



create type lending_status as enum ('PENDING', 'CANCELLED', 'APPROVED', 'LENDED', 'RETURNED');
create table lending(
	item_id integer references item(item_id),
	borrower_id varchar(10) references users(rollno),
	request_timestamp timestamp default now(),
	start_timestamp timestamp,
	end_timestamp timestamp,
	status lending_status default 'PENDING',
	user_review_stars integer,
	user_review_title varchar(64),
	user_review_content varchar(256),
	primary key(item_id, borrower_id, request_timestamp)
);



create table conversation(
	thread_id serial primary key,
	item_id integer references item(item_id),
	borrower_id varchar(10) references users(rollno)
);



create table post(
	post_id serial primary key,
	thread_id integer references conversation(thread_id),
	sender_id varchar(10) references users(rollno),
	timestamp timestamp default now(),
	text varchar(256)
);
