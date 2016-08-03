/*global javascripture*/
javascripture.api.morphology = {
	get: function (morph, includeLinks, lemma ) {
		if (includeLinks === undefined) {
			includeLinks = 'noLinks';
		}
		language = 'greek';
		if ( lemma.substring( 0, 1 ) === "H" ) {
			language = 'hebrew';
		}
		var morphologyDictionary = javascripture.data.morphology,
			markup = '',
			gender,
			morphArray,
			number,
			Case,
			person,
			case2,
			mood,
			voice,
			tense,
			partOfSpeech;
		if (morph !== undefined) {
			//hebrew
			if (morphologyDictionary.hebrew[morph] !== undefined) {
				markup += morphologyDictionary.hebrew[morph];
			} else {
				if ( 'hebrew' === language ) {
					morphParse = new MorphParse();
					if ( 'undefined' !== typeof morphParse.Parse( morph ) ) {
						markup += morphParse.Parse( 'H' + morph ); // The morphology API expexts the morph to be prepended with an H
					}
				} else {

					//greek
					morphArray = morph.split('-');
					partOfSpeech = morphArray[0];
					markup += morphologyDictionary.greek.partOfSpeech[partOfSpeech] + ' ';
					Case = morphArray[1];
					if (partOfSpeech === 'V') { //for verbs
						if (Case !== undefined) {
							if (morphologyDictionary.greek.Case[Case] !== undefined) {
								markup += morphologyDictionary.greek.Case[Case] + ' ';
							} else {
								if (parseInt(Case[0], 10) > 0) { // second future, second aorist and second perfect
									tense = Case[0] + Case[1];
									voice = Case[2];
									mood = Case[3];
								} else {
									tense = Case[0];
									voice = Case[1];
									mood = Case[2];
								}
								markup += morphologyDictionary.greek.Case.tense[tense] + ' ';
								markup += morphologyDictionary.greek.Case.voice[voice] + ' ';
								if ( includeLinks === 'withLinks' ) {
									markup += '<a href="#" class="morphSearch" data-word="" data-lemma="" data-morph="V-(.*)' + mood + '-" ';
									markup += 'data-language="greek" data-range="word" >';
								}
								markup += morphologyDictionary.greek.Case.mood[mood];
								if ( includeLinks === 'withLinks' ) {
									markup += '</a> '; //should be abstracted
								}
							}
						}
						if (morphArray[2] !== undefined) {
							markup += ' ';
							if (mood === "P" || mood === "R") {
								case2 = morphArray[2][0];
								markup += morphologyDictionary.greek.Case[case2] + ' ';
								number = morphArray[2][1];
								markup += morphologyDictionary.greek.number[number] + ' ';
								gender = morphArray[2][2];
								markup += morphologyDictionary.greek.gender[gender];
							} else {
								person = morphArray[2][0];
								markup += morphologyDictionary.greek.person[person] + ' ';
								number = morphArray[2][1];
								markup += morphologyDictionary.greek.number[number];
							}
						}
					} else {
						if (morphArray[1] !== undefined) {
							if (morphologyDictionary.greek.Case[Case] !== undefined) { //there are some nouns that have a 3 letter case code
								markup += morphologyDictionary.greek.Case[Case];
							} else {
								Case = morphArray[1][0];
								markup += morphologyDictionary.greek.Case[Case] + ' ';
								number = morphArray[1][1];
								markup += morphologyDictionary.greek.number[number] + ' ';
								gender = morphArray[1][2];
								markup += morphologyDictionary.greek.gender[gender];
							}
						}
					}
				}
			}
		}
		return markup;
	}
};