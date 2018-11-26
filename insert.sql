insert into users values ('160050009', 'Sourabh Tote', '', 'Room No 173', 'Hostel 2');
insert into users values ('160050050', 'Akshay Patidar', '/images/dps/akshay.jpg', 'Room No 173', 'Hostel 2');
insert into users values ('160050106', 'Dhruv Jaglan', '/images/dps/dhruv.jpg', 'Room No 174', 'Hostel 2');
insert into users values ('160050108', 'Bhavesh Dhingra', '/images/dps/bhavesh.jpg', 'Room No 174', 'Hostel 2');

insert into item (name, type, owner_id, description, available) values ('The Grand Design', 'Book', '160050108', 'A book by Stephen Hawking', true);
insert into item (name, type, owner_id, description, available) values ('Hyperspace', 'Book', '160050108', 'A book by Michio Kaku on higher dimensions', true);
insert into item (name, type, owner_id, description, available) values ('Calculator', 'Electronics', '160050009', 'Casio Scientific Calculator with matrix supprt', true);
insert into item (name, type, owner_id, description, available) values ('Tennis Racket', 'Sports Equipment', '160050050', 'A cool tennis racket in perfect condition', true);

insert into photo values (1, '/images/items/1.png');
insert into photo values (2, '/images/items/2.png');
insert into photo values (3, '/images/items/3.png');
insert into photo values (4, '/images/items/4.png');
insert into photo values (4, '/images/items/5.png');

insert into item_review values (1, '160050050', 4, 'Interesting Book', 'It is a really interesting book, a must read for all. Deducting one star for no bookmark!!');

insert into lending (item_id, borrower_id) values (1, '160050106');
insert into lending (item_id, borrower_id) values (3, '160050108');

insert into conversation (item_id, borrower_id) values (1, '160050106');
insert into conversation (item_id, borrower_id) values (3, '160050108');

insert into post (thread_id, sender_id, text) values (1, '160050106', 'Hi, Will you recommend this book for a beginner in this genre?');
insert into post (thread_id, sender_id, text) values (1, '160050108', 'Yes, Definitely');
insert into post (thread_id, sender_id, text) values (1, '160050106', 'When can I come to collect this?');
insert into post (thread_id, sender_id, text) values (2, '160050108', 'Hi, Does your calculator support integration formulae?');
insert into post (thread_id, sender_id, text) values (2, '160050009', 'No, unfortunately it does not');
