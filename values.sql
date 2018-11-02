insert into users values ('160050009', 'test-user-0', 'no-dp', 'address-0');
insert into users values ('160050106', 'test-user-1', 'no-dp', 'address-1');

insert into item (name, type, owner_id, description, available) values ('test-item-0', 'type0', '160050009', 'item0', 1);
insert into item (name, type, owner_id, description, available) values ('test-item-1', 'type1', '160050106', 'item1', 1);
insert into item (name, type, owner_id, description, available) values ('test-item-2', 'type2', '160050106', 'item2', 1);
insert into item (name, type, owner_id, description, available) values ('test-item-3', 'type3', '160050009', 'item3', 1);

insert into lending (item_id, borrower_id, request_timestamp, status) values (1, '160050106', now(), 0);
insert into lending (item_id, borrower_id, request_timestamp, status) values (2, '160050009', now(), 0);