// arghh es modules don't work
let { getHofCount, openHofDB } = (() => {
	const CACHE_EXPIRES = true;
	const CACHE_EXPIRY_TIME = 1000 * 60 * 60 * 24 * 7; // 1 week
	
	/**
	 * Returns how many users have solved a problem.
	 * @param {IDBDatabase} db The database to get the cache from
	 * @param {String} problemLink The link to the problem (e.g. https://orac2.info/problem/simpleadd/)
	 * @returns {Number}
	 */
	async function getHofCount(db, problemLink) {
		let hofLink = problemLink + "hof";
		let count;
		if(hofLink == location.href) {
			count = scrapeHofCountFromDoc(document);
		} else {
			if(db) {
				let cachedItem = await getFromCache(db, hofLink);
				if(cachedItem) {
					let age = new Date() - cachedItem.date;
					if(!CACHE_EXPIRES || age < CACHE_EXPIRY_TIME) {;
						return cachedItem;
					}
				}
			}
			count = await fetchHofCount(hofLink);
		}
		let date = new Date();
		db && addHofCountToCache(db, hofLink, count);
		return { count, date, hofLink };
	}
	
	/**
	 * Makes a HTTP request to find how many users have solved a problem.
	 * @param {String} hofLink The URL of the problem's Hall of Fame page
	 * @returns {Number}
	 */
	async function fetchHofCount(hofLink) {
		let res = await fetch(hofLink);
		if(res.status == 403) {
			throw new Error("Too many fetch requests for ORAC... we wouldn't be having these problems if we had an API would we now 🤨");
		}
		let html = await res.text();
		let parser = new DOMParser();
		let doc = parser.parseFromString(html, "text/html");
		return scrapeHofCountFromDoc(doc);
	}
	
	function scrapeHofCountFromDoc(doc) {
		if(doc.body.innerText.includes("Nobody has scored points on this problem yet. You could be the first!")) {
			return 0;
		}
		
		// Regular pages (95% of the time)
		let b = doc.querySelector("b");
		if(b) {
			return b.innerText;
		}
		
		// The ones with the list, idk if this is accurate or not.
		let leaderboardGridButActuallyList = doc.querySelector(".leaderboard-grid");
		if(leaderboardGridButActuallyList) {
			let count = leaderboardGridButActuallyList.childElementCount;
			if(count == 10) {
				return "10+"; // Limited to 10 entries on these questions :(
			} else {
				return count;
			}
		}
		
		throw new Error(`Fetch HoF count error: ${doc}`);
	}
	
	/**
	 * Opens the Hall of Fame cache database.
	 * @returns {Promise<IDBDatabase>}
	 */
	function openHofDB() {
		return new Promise((res, rej) => {
			let req = indexedDB.open("HofCacheDB", 1);
			req.addEventListener("upgradeneeded", e => {
				let db = e.target.result;
				if(e.oldVersion == 0) { // First time
					db.createObjectStore("hofCounts", {
						keyPath: "hofLink"
					});
				}
			});
			req.addEventListener("success", e => {
				let db = e.target.result;
				res(db);
			});
			req.addEventListener("error", e => {
				rej("IndexedDB opening error:", e.target.errorCode);
			});
		});
	}
	
	/**
	 * Adds a Hall of Fame count to a database, along with the current date and time.
	 * @param {IDBDatabase} db The database to add to
	 * @param {String} hofLink The URL of the problem's Hall of Fame page
	 * @param {Number} count How many people have stored
	 * @returns {Promise<Object>}
	 */
	function addHofCountToCache(db, hofLink, count) {
		let transaction = db.transaction(["hofCounts"], "readwrite");
		let store = transaction.objectStore("hofCounts");
		
		let date = new Date();
		let item = { hofLink, count, date };
		
		let req = store.put(item);
		return new Promise((res, rej) => {
			req.addEventListener("success", () => {
				res(item);
			});
			req.addEventListener("error", e => {
				rej(`Error adding to cache: ${e}`);
			});
		});
	}
	
	/**
	 * Gets the Hall of Fame count from a database.
	 * @param {IDBDatabase} db The database to get the cache from
	 * @param {*} hofLink The URL of the problem's Hall of Fame page
	 * @returns {Promise<Object>}
	 */
	function getFromCache(db, hofLink) {
		let transaction = db.transaction(["hofCounts"], "readonly");
		let store = transaction.objectStore("hofCounts");
		let req = store.get(hofLink);
		
		return new Promise((res, rej) => {
			req.addEventListener("success", () => {
				res(req.result);
			});
			req.addEventListener("error", e => {
				rej(`Error fetching from cache: ${e.target.errorCode}`);
			});
		});
	}
	
	return { getHofCount, openHofDB };
})();