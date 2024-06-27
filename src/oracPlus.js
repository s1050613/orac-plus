if(window.ORACPLUS) throw new Error("ORAC+ already loaded!");
window.ORACPLUS = true;

console.log("ORAC+ loaded!");

const selectEl = document.querySelector.bind(document);
const selectEls = document.querySelectorAll.bind(document);

const personEmojis = ["🎅", "👮‍♂️", "🕵️‍♂️", "💂‍♂️", "👷‍♂️", "👨‍🎓", "👨‍🌾", "👨‍🍳", "👨‍🔧", "👨‍🏭", "👨‍💼", "👨‍🔬", "👨‍💻"];
const personEmoji = personEmojis[~~(Math.random() * personEmojis.length)];

const EXPIRES = true;
const EXPIRY_TIME = 1000 * 60 * 60 * 24 * 7; // 1 week

let observer = new IntersectionObserver((entries, observer) => {
	entries.forEach(entry => {
		if(entry.isIntersecting) {
			observer.unobserve(entry.target);
			addHofCountBadge(entry.target);
		}
	});
}, {
	root: null,
	rootMargin: "0px",
	threshold: 0
});

function addAllHofCounts() {
	let problemAnchors = selectEls(`a[href^="/problem"]`);
	problemAnchors.forEach(a => {
		observer.observe(a);
	});
}
function addHofCountBadge(a) {
	let hofLink = a.href.replace(/\/$/, "") + "/hof";
	hofCount(hofLink).then(count => {
		if(count === null) return;
		a.parentElement.nextElementSibling.innerHTML += `
			<span class="badge">${count}${personEmoji}</span>
		`;
	});
}

let db;

function openDB() {
	const request = indexedDB.open("HofCacheDB", 1);
	request.addEventListener("upgradeneeded", e => {
		db = e.target.result;
		if(!db.objectStoreNames.contains("hofCounts")) {
			db.createObjectStore("hofCounts", { keyPath: "link" });
		}
		addAllHofCounts();
	});
	request.addEventListener("success", e => {
		db = e.target.result;
		addAllHofCounts();
	});
	request.addEventListener("error", e => {
		console.error("IndexedDB error:", e.target.errorCode);
	});
}

openDB();

function addToCache(link, count) {
	let transaction = db.transaction(["hofCounts"], "readwrite");
	let store = transaction.objectStore("hofCounts");
	let now = new Date();
	let item = {
		link: link,
		count: count,
		date: now.toISOString()
	};
	store.put(item);
}

function getFromCache(link) {
	return new Promise((resolve, reject) => {
		let transaction = db.transaction(["hofCounts"], "readonly");
		let store = transaction.objectStore("hofCounts");
		let request = store.get(link);

		request.addEventListener("success", () => {
			resolve(request.result);
		});

		request.addEventListener("error", e => {
			reject("Error fetching from cache: ", e.target.errorCode);
		});
	});
}

async function hofCount(hofLink) {
	try {
		let cachedItem = await getFromCache(hofLink);
		if(cachedItem && !(EXPIRES && new Date() - new Date(cachedItem.date) >= EXPIRY_TIME)) {
			console.log("returned " + cachedItem.count +" from cache!!");
			return cachedItem.count;
		} else {
			return await fetchHofCount(hofLink);
		}
	} catch(e) {
		console.log("failed lol: ", e);
		return null;
	}
}

async function fetchHofCount(hofLink) {
	let res = await fetch(hofLink);
	let html = await res.text();
	let parser = new DOMParser();
	let doc = parser.parseFromString(html, "text/html");
	let b = doc.documentElement.querySelector("b");
	if(!b) {
		throw new Error("forbidden?? 403 or 429??!?! hehehe");
	}
	let count = b.innerText;
	addToCache(hofLink, count);
	return count;
}