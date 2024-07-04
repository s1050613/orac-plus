document.addEventListener("DOMContentLoaded", () => {
	let emojiPreferenceForm = document.forms.namedItem("emojiPreferenceForm");
	let emojiPreference = emojiPreferenceForm.elements.namedItem("emojiPreference");
	emojiPreferenceForm.addEventListener("change", e => {
		if(e.target.name == "emojiPreference") {
			setLocalExtensionStorage({
				emojiPreference: emojiPreference.value
			});
		}
	});
	getLocalExtensionStorage("emojiPreference").then(pref => {
		emojiPreference.value = pref || "mixed";
	});
});