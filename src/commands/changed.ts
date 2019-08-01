import * as minimatch from 'minimatch';
import { env } from 'process';
import { JghToolbox } from '../JghToolbox';

module.exports = {
	name: 'changed',
	description:
		'whether or not any of a set of files has changed. ex: $BRAND changed src/**/*',
	run: async (toolbox: JghToolbox) => {
		const {
			print,
			parameters: {
				first: glob,
				options: { json, verbose }
			},
			strings: { isBlank },
			system: { run }
		} = toolbox;

		if (isBlank(glob)) {
			return handleError(
				'You must provide a valid glob with the files you are checking.',
				json,
				toolbox
			);
		}

		const changedFilesOutput = await run(
			`git diff ${env.GIT_COMMIT} ${env.GIT_PREVIOUS_SUCCESSFUL_COMMIT ||
				env.GIT_PREVIOUS_COMMIT ||
				env.CHANGE_TARGET ||
				''} --name-only`,
			{
				trim: true
			}
		);

		const changedFiles = changedFilesOutput
			.split('\n')
			.map(file => file.trim());

		const result: { matched?: string[]; changed?: string[] } = {};

		if (json !== true && verbose === true) {
			print.debug(changedFiles, 'Changed files');
		}

		const matched = minimatch.match(changedFiles, glob);
		result.matched = matched;
		if (json === true && verbose === true) {
			result.changed = changedFiles;
		}

		return handleResult(
			result,
			json,
			toolbox,
			matched.length === 0 ? 1 : 0
		);
	}
};

function handleError(message: string, json: unknown, toolbox: JghToolbox) {
	if (json === true) {
		toolbox.print.fancy(
			JSON.stringify({
				error: true,
				message
			})
		);
		return 0;
	} else {
		toolbox.print.error('Ran into an issue while executing the command:');
		toolbox.print.error(message);
		toolbox.print.printHelp(toolbox);
		return 1;
	}
}

function handleResult(
	result: any,
	json: unknown,
	toolbox: JghToolbox,
	errorCode = 0
) {
	if (json === true) {
		toolbox.print.fancy(
			JSON.stringify({
				error: false,
				result
			})
		);
		return 0;
	} else {
		if (errorCode === 0) {
			toolbox.print.success(result);
		} else {
			toolbox.print.error(result);
		}
		return errorCode;
	}
}
