if(/\/hof$/.test(location.href)) {
	// TODO: On the Hall of Fame page already, so update the database.
}

let problemLink = location.href.match(/^.+\/problem\/[^\/]+\//)[0];

openHofDB().then(hofDB => getHofCount(hofDB, problemLink)).then(({ count, date }) => {
	let hofButton = document.querySelector(`a[href$="hof"]`);
	let title = `${count} users have solved this problem as of ${date.toLocaleString()}`;
	hofButton.innerHTML += `
		<span class="badge badge-hof-count" title="${title}">${count}${personEmoji}</span>
	`;
}).catch(e => {
	throw e;
});