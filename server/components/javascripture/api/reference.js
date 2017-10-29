/*globals javascripture, bible*/
var reference = function(javascripture) {
	var bible = javascripture.data.bible;
    javascripture.api.reference = {
	getThreeChapters: function( reference ) {
		var testament = this.getTestament( reference.book );

		var result = { reference: reference };

		reference.rightData = reference.rightVersion;
		reference.leftData = reference.leftVersion;
		if ( "original" === reference.rightVersion ||  "lc" === reference.rightVersion ) {
			reference.rightData = testament;
		}

		if ( "original" === reference.leftVersion || "lc" === reference.leftVersion ) {
			reference.leftData = testament;
		}

		var self = this,
			book = reference.book,
			prev = self.getOffsetChapter( reference, -1 ),
			next = self.getOffsetChapter( reference, 1 );

		if ( prev.book ) {
			result.prev = prev;
		}
		if ( next.book ) {
			result.next = next;
		}

		result.leftVersion = reference.leftVersion;
		result.rightVersion = reference.rightVersion;
		if( javascripture.data.hebrew[book] ) {
			result.testament = 'hebrew';
		} else {
			result.testament = 'greek';
		}

		result.chapters = [];

		//add the previous chapter if it exists
		if ( prev.book ) {
			result.chapters.push( javascripture.api.reference.getChapterData( prev ) );
		}

		result.chapters.push( javascripture.api.reference.getChapterData( reference ) );
		//add the next chapter if it exists
		if ( next.book ) {
			result.chapters.push( javascripture.api.reference.getChapterData( next ) );
		}
		return result;
	},
	getTestament: function( book ) {
		var hebrew = javascripture.data.hebrew.text(); 
		if( hebrew[ book ] ) {
			return 'hebrew';
		} else {
			return 'greek';
		}
	},
	getChapterData: function( reference ) {
		var book = reference.book,
			chapter = reference.chapter,
			chapterInArray = chapter - 1,
			result = {},
			testament = this.getTestament( book );

		result.book = book;
		result.chapter = chapter;
		if ( reference.verse ) {
			result.verse = reference.verse;
		} else {
			result.verse = 0;
		}

		var right = javascripture.data[ reference.rightData ] ? javascripture.data[ reference.rightData ].text() : null;
		if ( right && right[ book ] && right[ book ][ chapterInArray ] ) {
			result.right = right[ book ][ chapterInArray ];
			var left = javascripture.data[ reference.leftData ] ? javascripture.data[ reference.leftData ].text() : null;
			
			if( left && left[ book ] && left[ book ][ chapterInArray ] ) {
				result.left = left[ book ][ chapterInArray ];
			}
		}
		return result;
	},
	getOffsetChapter: function ( reference, offset) {
		var book = reference.book,
			chapter = reference.chapter,
			offsetChapter = {
				leftData: reference.leftData,
				rightData: reference.rightData
			},
			offsetChapterNumber = parseInt(chapter, 10) + offset,
			offsetNumberJavascript = offsetChapterNumber - 1,
			offsetBook;
		var right =javascripture.data[reference.rightData] ? javascripture.data[reference.rightData].text() : null;
		if ( right && right[book] && right[book][offsetNumberJavascript] !== undefined) {
			offsetChapter.book = book;
			offsetChapter.chapter = offsetChapterNumber;
		} else {
			//get the offset book
			bible.Data.books.forEach( function ( loopBookArray, index ) {
				if (loopBookArray[0] === book) {
					offsetBook = index + offset;
					if (bible.Data.books[offsetBook] !== undefined) {
						offsetChapter.book = bible.Data.books[offsetBook][0];
						//only supports offsets of 1 or -1. to make it work with bigger values this will have to change
						if (offset > 0) {
							offsetChapter.chapter = 1;
						} else {
							offsetChapter.chapter = bible.Data.verses[offsetBook].length;
						}
					}
				}
			} );
		}
		return offsetChapter;
	}
}};
module.exports = reference;