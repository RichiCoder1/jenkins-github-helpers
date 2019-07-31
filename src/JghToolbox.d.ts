import { GluegunToolbox } from 'gluegun';
import * as Ockokit from '@octokit/rest';

export interface GithubExtension {
	token: string | undefined;
	isToken: boolean;
	isTokenValid: () => Promise<boolean>;
	client: Ockokit;
}

export interface JghToolbox extends GluegunToolbox {
	github: Readonly<GithubExtension>;
}
