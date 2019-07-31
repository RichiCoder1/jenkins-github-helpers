# jenkins-github-helpers CLI

A CLI for jenkins-github-helpers.

## Commands

Adding a comment:

```bash
npx -p @richicoder1/jenkins-github-helpers jgh comment --body "Hello World!"
```

Options are:

| Flag | Description |
|----------|-----------------------------------------------------------|
| `--body <string>` | The body of the comment. Either `--body` or `--bodyFile` is required. |
| `--bodyFile <fileName>` | A file containing the body of the comment. Either `--body` or `--bodyFile` is required. |
| `--deleteBodyFile` | If this flag is specified, `jgh` will delete the specified `bodyFile` after it has run. |
| `--once <key>` | Specify this to only post a comment to a PR once. It uses the specified key to ensure it is unique. |

**NOTE:** This command assumes the presence of a `GH_TOKEN` that has permissions to add comments to a link. It also assumes the presense of either a `CHANGE_URL`, or a `GIT_URL` formatted as an https git link and a `CHANGE_ID`. The former _should_ be provided in a standard jenkins environment.

# License

MIT - see LICENSE
