drop table product_review;
drop table post;
drop table photo;
drop table conversation;
drop table lending;
drop table item;
drop table users;

create table users(
	rollno varchar(10) primary key,
	name varchar(20),
	dp varchar(200),
	address varchar(10)
);


create table item(
    item_id serial primary key,
    name varchar(20),
  	type varchar(5),
    owner_id varchar(10) references users(rollno),
    description varchar(256),
    available integer
);


create table lending(
	item_id integer references item(item_id),
	borrower_id varchar(10) references users(rollno),
	request_timestamp timestamp,
	start_timestamp timestamp,
	end_timestamp timestamp,
	status integer,
	user_review_stars integer,
	user_review_title varchar(64),
	user_review_content varchar(256),
	primary key(item_id,borrower_id, request_timestamp)
);

create table product_review(
	item_id integer references item(item_id),
	user_id varchar(10) references users(rollno),
	product_review_stars integer,
	product_review_title varchar(64),
	product_review_content varchar(256),
	primary key(item_id,user_id)
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
	timestamp timestamp,
	text varchar(256)
);

create table photo(
	item_id integer references item(item_id),
	photo varchar(200),
	primary key(item_id,photo)
);
