console.log("ORAC+ loaded!");

function isChristmasDay() {
	let now = new Date();
	return now.getMonth() == 12 && now.getDate() == 25;
}

const getPersonEmoji = new Promise(res => {
	const personEmojis = ["👮‍♂️", "🕵️‍♂️", "💂‍♂️", "👷‍♂️", "👨‍🎓", "👨‍🌾", "👨‍🍳", "👨‍🔧", "👨‍🏭", "👨‍💼", "👨‍🔬", "👨‍💻", "👨‍🎨", "👨‍✈️", "👨‍🚀", "👨‍🚒", "🦸‍♂️"];
	let personEmoji = isChristmasDay()? "🎅" : personEmojis[~~(Math.random() * personEmojis.length)];
	browser.storage.local.get("emojiPreference").then(pref => {
		if(pref.emojiPreference) {
			let femaleChance = 0.5;
			switch(pref.emojiPreference) {
				case "male": {
					femaleChance = 0;
					break;
				}
				case "mixed": break;
				case "female": {
					femaleChance = 1;
					break;
				}
				default: {
					console.warn(new Error(`Unknown emoji preference "${pref.emojiPreference}"`));
				}
			}
			if(Math.random() < femaleChance) {
				let maleEmoji = personEmoji;
				let codePoints = [...personEmoji].map(c => c.codePointAt(0));
				function replaceCodePoint(a, b) {
					if(codePoints.includes(a)) {
						codePoints[codePoints.indexOf(a)] = b;
					}
				}
				replaceCodePoint(128104, 128105); // 👨 -> 👩
				replaceCodePoint(9794, 9792); // ♂ -> ♀
				replaceCodePoint(127877, 129334); // 🎅 -> 🤶
				personEmoji = String.fromCodePoint(...codePoints);
				if(personEmoji == maleEmoji) {
					console.warn(new Error(`Cannot make female emoji from "${personEmoji}" with code points ${JSON.stringify(codePoints)}`));
				}
			}
			res(personEmoji);
		}
	});
});