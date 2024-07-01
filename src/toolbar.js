document.addEventListener("DOMContentLoaded", () => {
	let emojiPreferenceForm = document.forms.namedItem("emojiPreferenceForm");
	let emojiPreference = emojiPreferenceForm.elements.namedItem("emojiPreference");
	emojiPreferenceForm.addEventListener("change", e => {
		if(e.target.name == "emojiPreference") {
			browser.storage.local.set({
				emojiPreference: emojiPreference.value
			});
		}
	});
	browser.storage.local.get("emojiPreference").then(pref => {
		emojiPreference.value = pref.emojiPreference || "mixed";
	});
});