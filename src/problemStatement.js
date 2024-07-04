let problemLink = location.href.match(/^.+\/problem\/[^\/]+\//)[0];

openHofDB().then(hofDB => getHofCount(hofDB, problemLink)).then(({ count, date }) => {
	getPersonEmoji.then(personEmoji => {
		let hofButton = document.querySelector(`a[href$="hof"]`);
		let title = `${count} user${count != 1 && "s"} have solved this problem as of ${date.toLocaleString()}`;
		hofButton.innerHTML += `
			<span class="badge badge-hof-count" title="${title}">${count}${personEmoji}</span>
		`;
	});
});