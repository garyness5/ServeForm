export default {

	currency(value) {
		if (value === null || value === undefined || value === "") return "";

		const n = Number(value);

		if (!isFinite(n)) return "";

		return n.toFixed(2);
	},

	number(value) {
		if (value === null || value === undefined || value === "") return "";

		const n = Number(value);

		if (!isFinite(n)) return "";

		if (Number.isInteger(n)) {
			return String(n);
		}

		return Number(n.toFixed(2)).toString();
	}
}