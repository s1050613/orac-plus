function addAllHofCounts(hofDB) {
	let visibilityObserver = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			if(entry.isIntersecting) {
				visibilityObserver.unobserve(entry.target);
				addHofCountBadge(hofDB, entry.target);
			}
		});
	});
	let problemAnchors = document.querySelectorAll(`a[href^="/problem"]`);
	problemAnchors.forEach(a => {
		visibilityObserver.observe(a);
	});
}
function addHofCountBadge(hofDB, a) {
	getHofCount(hofDB, a.href).then(({ count, date }) => {
		getPersonEmoji.then(personEmoji => {
			let title = `${count} user${count != 1 && "s"} have solved this problem as of ${date.toLocaleString()}`;
			a.parentElement.nextElementSibling.innerHTML += `
				<span class="badge badge-hof-count" title="${title}">${count}${personEmoji}</span>
			`;
		});
	});
}

openHofDB().then(hofDB => {
	addAllHofCounts(hofDB);
});