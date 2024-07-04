function mean(array) {
	return array.reduce((a, b) => a + b) / array.length;
}

let allCases = [];

let subtaskTables = document.querySelectorAll(`div[id^="subtask-"] > table`);
subtaskTables.forEach(subtaskTable => {
	let isSampleCaseTable = subtaskTable.parentElement.id == "subtask-1";
	
	let cases = [];
	[...subtaskTable.querySelectorAll("tr")].forEach(tr => {
		if(isSampleCaseTable && !tr.dataset.toggle) {
			return; // Program/Sample output comparison for sample cases
		}
		let [timeEl, memoryEl] = tr.querySelectorAll("td");
		let timeStr = timeEl.innerText.trim();
		if(timeStr == "-") {
			return; // Case was skipped
		}
		let time = parseFloat(timeStr.slice(timeStr[0] == ">"));
		let memory;
		if(memoryEl.innerText == "-") {
			memory = 0;
		} else {
			memory = parseInt(memoryEl.title);
			memoryEl.innerText = `${(memory / 1024 / 1024).toFixed(2)} MiB`;
		}
		cases.push({ time, memory });
	});
	if(!isSampleCaseTable) {
		allCases.push(...cases);
	}
	
	let headings = document.querySelector(`thead[data-target="#${subtaskTable.parentElement.id}"]`).querySelectorAll("th");
	let averageTime = mean(cases.map(x => x.time));
	let averageTimeStr = `${averageTime.toFixed(3)}s`;
	headings[1].innerText += `, μ = ${averageTimeStr}`;
	let averageMemory = mean(cases.map(x => x.memory));
	let averageMemoryStr = `${(averageMemory / 1024 / 1024).toFixed(2)} MiB`;
	headings[2].innerText = `Max: ${(Math.max(...cases.map(x => x.memory)) / 1024 / 1024).toFixed(2)} MiB, μ = ${averageMemoryStr}`;
});

let averageTime = mean(allCases.map(x => x.time));
let averageTimeStr = `${averageTime.toFixed(3)}s`;
let averageMemory = mean(allCases.map(x => x.memory));
let averageMemoryStr = `${(averageMemory / 1024 / 1024).toFixed(2)} MiB`;

let overviewTableBody = document.querySelector("div.container-xl > div.card.my-2 > table > tbody");
overviewTableBody.innerHTML += `
	<tr>
		<th>Overview:</th>
		<td>Time: μ = ${averageTimeStr}, memory: μ = ${averageMemoryStr}</td>
	</tr>
`;