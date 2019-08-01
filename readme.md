# jenkins-github-helpers CLI

A CLI for jenkins-github-helpers.

## Commands

### Comment

Adding a comment to a PR:

```bash
npx -p @richicoder1/jenkins-github-helpers jgh comment --body "Hello World!"
```

Options are:

| Flag                    | Description                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| `--body <string>`       | The body of the comment. Either `--body` or `--bodyFile` is required.                               |
| `--bodyFile <fileName>` | A file containing the body of the comment. Either `--body` or `--bodyFile` is required.             |
| `--deleteBodyFile`      | If this flag is specified, `jgh` will delete the specified `bodyFile` after it has run.             |
| `--once <key>`          | Specify this to only post a comment to a PR once. It uses the specified key to ensure it is unique. |

**NOTE:** This command assumes the presence of a `GH_TOKEN` that has permissions to add comments to a link. It also assumes the presense of either a `CHANGE_URL`, or a `GIT_URL` formatted as an https git link and a `CHANGE_ID`. The former _should_ be provided in a standard jenkins environment.

### Files Changed

Helper command for detecting if a glob of files has changed

```bash
npx -p @richicoder1/jenkins-github-helpers jgh changed src/**
```

with a return result of `0` meaning a match was found, and a return result of `1` meaning no matches were found.

Alternatively, if you want to parse the output and consume it from javascript, you can pass the `--json` flag.

```bash
npx -p @richicoder1/jenkins-github-helpers jgh changed package* --json
```

The output would look something like:

_success_

```json
{
	"error": false,
	"result": { "matched": ["package-lock.json", "package.json"] }
}
```

_failure_

```json
{"error":false,"result":{"matched":[]}}}
```

_error_

```json
{ "error": true, "message": "something bad happened" }
```

#### Flags

| Flag        | Description                                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `--json`    | Output results to `stdout` as json. Always returns `0`.                                                                                  |
| `--verbose` | Outputs the changed files in addition the the matched files. In `--json` mode, this means there will be a `changed` array in the result. |

**NOTE:** This command assumes the presence of a `GH_TOKEN` that has permissions to add comments to a link. It also assumes the presense of either a `CHANGE_URL`, or a `GIT_URL` formatted as an https git link and a `CHANGE_ID`. The former _should_ be provided in a standard jenkins environment.

# License

MIT - see LICENSE
