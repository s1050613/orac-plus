console.log("ORAC+ loaded!");

function getLocalExtensionStorage(key) {
	return new Promise((res, rej) => {
		(globalThis.browser ?? globalThis.chrome).storage.local.get(key).then(value => {
			res(value[key]);
		}).catch(e => {
			rej(e);
		});
	});
}
function setLocalExtensionStorage(stuff) {
	return new Promise((res, rej) => {
		(globalThis.browser ?? globalThis.chrome).storage.local.set(stuff).then(idk => {
			res(idk);
		}).catch(e => {
			rej(e);
		});
	});
}

function isChristmasDay() {
	let now = new Date();
	return now.getMonth() == 12 && now.getDate() == 25;
}

function maybeMakeEmojiFemale(emoji, femaleChance) {
	if(Math.random() < femaleChance) {
		let maleEmoji = emoji;
		let codePoints = [...emoji].map(c => c.codePointAt(0));
		function replaceCodePoint(a, b) {
			if(codePoints.includes(a)) {
				codePoints[codePoints.indexOf(a)] = b;
			}
		}
		replaceCodePoint(128104, 128105); // 👨 -> 👩
		replaceCodePoint(9794, 9792); // ♂ -> ♀
		replaceCodePoint(127877, 129334); // 🎅 -> 🤶
		emoji = String.fromCodePoint(...codePoints);
		if(emoji == maleEmoji) {
			console.warn(new Error(`Cannot make female emoji from "${emoji}" with code points ${JSON.stringify(codePoints)}`));
		}
	}
	return emoji;
}

const getPersonEmoji = new Promise((res, rej) => {
	const personEmojis = ["👮‍♂️", "🕵️‍♂️", "💂‍♂️", "👷‍♂️", "👨‍🎓", "👨‍🌾", "👨‍🍳", "👨‍🔧", "👨‍🏭", "👨‍💼", "👨‍🔬", "👨‍💻", "👨‍🎨", "👨‍✈️", "👨‍🚀", "👨‍🚒", "🦸‍♂️"];
	let personEmoji = isChristmasDay()? "🎅" : personEmojis[~~(Math.random() * personEmojis.length)];
	getLocalExtensionStorage("emojiPreference").then(emojiPreference => {
		let femaleChance = 0.5;
		if(emojiPreference) {
			switch(emojiPreference) {
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
					console.warn(new Error(`Unknown emoji preference "${emojiPreference}"`));
				}
			}
		}
		personEmoji = maybeMakeEmojiFemale(personEmoji, femaleChance);
		res(personEmoji);
	}).catch(e => {
		personEmoji = maybeMakeEmojiFemale(personEmoji, 0.5);
		res(personEmoji);
		rej(e); // idk if this is illegal or not
	});
});