import { env } from 'process';
import * as Octokit from '@octokit/rest';
import { JghToolbox } from '../JghToolbox';

module.exports = (toolbox: JghToolbox) => {
	const {
		strings: { isBlank },
		print: { error }
	} = toolbox;
	const token = env.GH_TOKEN;
	const client = new Octokit({
		auth: token
	});
	toolbox.github = {
		token,
		isToken: !isBlank(token),
		client,
		isTokenValid: async () => {
			try {
				await client.users.getAuthenticated();
				return true;
			} catch (e) {
				error(e);
				return false;
			}
		}
	};
	Object.freeze(toolbox.github);
};
