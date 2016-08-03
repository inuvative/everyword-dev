var jsonfile = require('jsonfile');

var file = 'ot.json';

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
books.push(bookJson('Genesis',50));
books.push(bookJson('Exodus',40));
books.push(bookJson('Leviticus',27));
books.push(bookJson('Numbers',36));
books.push(bookJson('Deuteronomy',34));
books.push(bookJson('Joshua',24));
books.push(bookJson('Judges',21));
books.push(bookJson('Ruth',4));
books.push(bookJson('1 Samuel',31));
books.push(bookJson('2 Samuel',24));
books.push(bookJson('1 Kings',22));
books.push(bookJson('2 Kings',25));
books.push(bookJson('1 Chronicles',29));
books.push(bookJson('2 Chronicles',36));
books.push(bookJson('Ezra',10));
books.push(bookJson('Nehemiah',13));
books.push(bookJson('Esther',10));
books.push(bookJson('Job',42));
books.push(bookJson('Psalm',150));
books.push(bookJson('Proverbs',31));
books.push(bookJson('Ecclesiastes',12));
books.push(bookJson('Song of Solomon',8));
books.push(bookJson('Isaiah',66));
books.push(bookJson('Jeremiah',52));
books.push(bookJson('Lamentations',5));
books.push(bookJson('Ezekiel',48));
books.push(bookJson('Daniel',12));
books.push(bookJson('Hosea',14));
books.push(bookJson('Joel',3));
books.push(bookJson('Amos',9));
books.push(bookJson('Obadiah',1));
books.push(bookJson('Jonah',4));
books.push(bookJson('Micah',7));
books.push(bookJson('Nahum',3));
books.push(bookJson('Habakkuk',3));
books.push(bookJson('Zephaniah',3));
books.push(bookJson('Haggai',2));
books.push(bookJson('Zechariah',14));
books.push(bookJson('Malachi',4));

jsonfile.writeFile(file,books,function(err) { console.error(err);});


