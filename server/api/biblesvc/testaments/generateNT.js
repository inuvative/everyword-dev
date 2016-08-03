var jsonfile = require('jsonfile');

var file = 'nt.json';

var bookJson = function(bk,chptrs) {
     var b = {};
     b.name = bk;
     b.chapters = [];
     for(var i=1;i<=chptrs;i++) {
         b.chapters.push(''+i);
     }
     return b;
};

var books=[];
books.push(bookJson('Matthew',28));
books.push(bookJson('Mark',16));
books.push(bookJson('Luke',24));
books.push(bookJson('John',21));
books.push(bookJson('Acts',28));
books.push(bookJson('Romans',16));
books.push(bookJson('1 Corinthians',16));
books.push(bookJson('2 Corinthians',13));
books.push(bookJson('Galatians',6));
books.push(bookJson('Ephesians',6));
books.push(bookJson('Phillipians',4));
books.push(bookJson('Colossians',4));
books.push(bookJson('1 Thessalonians',5));
books.push(bookJson('2 Thessalonians',3));
books.push(bookJson('1 Timothy',6));
books.push(bookJson('2 Timothy',4));
books.push(bookJson('Titus',3));
books.push(bookJson('Philemon',1));
books.push(bookJson('Hebrews',13));
books.push(bookJson('James',5));
books.push(bookJson('1 Peter',5));
books.push(bookJson('2 Peter',3));
books.push(bookJson('1 John',5));
books.push(bookJson('2 John',1));
books.push(bookJson('3 John',1));
books.push(bookJson('Jude',1));
books.push(bookJson('Revelation',22));

jsonfile.writeFile(file,books,function(err) { console.error(err);});


