export default {
	mappings: [
		{
			match:
			"This sub-recipe would create a circular Recipe reference.",
			message:
			"Cannot save this Recipe because one of the selected sub-recipes includes this Recipe again."
		}
	],

	rawMessage(error) {
		return String(
			error?.message ||
			error ||
			""
		).trim();
	},

	friendly(error) {
		const raw =
					this.rawMessage(error);

		if (!raw) {
			return "The action could not be completed.";
		}

		const found =
					this.mappings.find(x =>
														 raw.toLowerCase().includes(
						x.match.toLowerCase()
					)
														);

		if (found) {
			return found.message;
		}

		return this.cleanTechnicalDetails(raw);
	},

	cleanTechnicalDetails(raw) {
		let text =
				String(raw || "").trim();

		/*
			Keep the useful database message,
			remove Postgres / PLpgSQL implementation noise.
		*/
		text =
			text
			.replace(
			/\s+Where:\s+PL\/pgSQL[\s\S]*$/i,
			""
		)
			.replace(
			/\s+CONTEXT:\s+PL\/pgSQL[\s\S]*$/i,
			""
		)
			.trim();

		text =
			text.replace(
			/^ERROR:\s*/i,
			""
		);

		return (
			text ||
			"The action could not be completed."
		);
	}
};