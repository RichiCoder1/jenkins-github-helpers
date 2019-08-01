import { env } from 'process';
import { JghToolbox } from '../JghToolbox';
import { IssuesListCommentsResponseItem } from '@octokit/rest';

module.exports = {
	name: 'comment',
	description: 'Posts a comment to a PR',
	run: async (toolbox: JghToolbox) => {
		const {
			print,
			parameters: { options },
			strings: { isBlank, isNotString },
			github
		} = toolbox;

		const { body, bodyFile, once, token } = options;

		if (once && isNotString(once)) {
			print.error(
				'If you provide --once, it much be based a string value which is the unique key for this comment.'
			);
			print.printHelp(toolbox);
			return 1;
		}

		if (isBlank(body) && isBlank(bodyFile)) {
			print.error('You must provide either --body or --bodyFile.');
			print.printHelp(toolbox);
			return 1;
		}

		const githubToken = env.GH_TOKEN || token;

		if (isBlank(githubToken)) {
			print.error(
				'You must provide a github personal access token, either as env.GH_TOKEN or through token argument.'
			);
			print.printHelp(toolbox);
			return 1;
		}

		const isTokenValid = await github.isTokenValid();

		if (isTokenValid !== true) {
			print.error(
				'Unable to authenticate. There seems to be an issue with your token.'
			);
			print.error('Error:');
			print.error(isTokenValid);
			return 1;
		}

		const gitBuildInfo = getGithubParams(toolbox);
		if (gitBuildInfo === false) {
			return 1;
		}

		if (once) {
			const commentsUrl = github.client.issues.listComments.endpoint.merge(
				gitBuildInfo
			);
			const comments = (await github.client.paginate(
				commentsUrl
			)) as IssuesListCommentsResponseItem[];
			for (const comment of comments) {
				if (comment.body.includes(`comment key: ${once}`)) {
					print.info(
						'Found previous comment. The flag --once is enabled, skipping commenting.'
					);
					print.info(comment.html_url);
					return 0;
				}
			}
		}

		// We're commenting through the issue API as that's how you post a general
		// comment. The pull request api's comments
		const commentOptions = {
			...gitBuildInfo,
			body: await getCommentBody(toolbox)
		};

		await github.client.issues.createComment(commentOptions);
	}
};

const prUrlRegex = /^https:\/\/github\.com\/(.*)\/(.*)\/pull\/(\d+)/;
const gitUrlRegex = /^https:\/\/github\.com\/(.*)\/(.*)\.git/;

function getGithubParams(toolbox: JghToolbox) {
	const githubUrl = env.GIT_URL;
	const pullRequestUrl = env.CHANGE_URL;
	const pullRequestId = env.CHANGE_ID;

	const {
		strings: { isBlank },
		print: { error }
	} = toolbox;

	if (
		isBlank(pullRequestUrl) &&
		isBlank(githubUrl) &&
		isBlank(pullRequestId)
	) {
		error(
			`You must provide either GIT_URL and CHANGE_ID, or the CHANGE_URL`
		);
		return false;
	}

	if (!isBlank(pullRequestUrl)) {
		const matches = prUrlRegex.exec(pullRequestUrl);
		return {
			owner: matches[1],
			repo: matches[2],
			issue_number: Number(matches[3])
		};
	} else {
		const urlMatches = gitUrlRegex.exec(githubUrl);
		return {
			owner: urlMatches[1],
			repo: urlMatches[2],
			issue_number: Number(pullRequestId)
		};
	}
}

async function getCommentBody(toolbox: JghToolbox) {
	const {
		parameters: {
			options: { body, bodyFile, deleteBodyFile, once }
		},
		strings: { isBlank },
		filesystem: { existsAsync, readAsync, removeAsync },
		print: { error }
	} = toolbox;

	if (!isBlank(body)) {
		let commentBody = body;
		if (once) {
			commentBody += `\n<sub>this is a bot comment\n<sup>comment key: ${once}</sup></sub>`;
		} else {
			commentBody += `\n<sub>this is a bot comment</sub>`;
		}
		return commentBody;
	} else {
		if (!(await existsAsync(bodyFile))) {
			throw Error(`Can't find commentFile: "${bodyFile}".`);
		}

		let commentBody: string = await readAsync(bodyFile, 'utf8');
		if (once) {
			commentBody += `\n<sub>this is a bot comment\n<sup>comment key: ${once}</sup></sub>`;
		} else {
			commentBody += `\n<sub>this is a bot comment</sub>`;
		}
		if (deleteBodyFile) {
			try {
				await removeAsync(bodyFile);
			} catch (e) {
				error('Failed to remove the comment bodyFile.');
				error(e);
			}
		}
		return commentBody;
	}
}
