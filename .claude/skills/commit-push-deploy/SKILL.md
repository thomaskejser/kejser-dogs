---
name: commit-push-deploy
description: Commit, push and deploy the Dogs site to https://dogs.kejser.org. Use when Thomas says "commit, push and deploy", or asks for any of the three.
---

# Commit, push and deploy

Only run this when Thomas asks.
If he asks for only one or two of the steps, do just those, in this order.

## 1. Check

Run all four, and stop if any fails:

```sh
npm run build   # fails on broken links
npm test
npm run lint
npm run check
```

## 2. Commit

- `git pull --rebase` first if the session has been idle for a while.
- Stage explicit file paths only; never `git add -A` or `git add .`.
- Read `git diff --cached --name-status` before every commit, and make sure nothing unintended is staged.
- One author per commit, with a short imperative subject in the style of `git log`, and end the message with the session trailers.
- Never print credentials.

## 3. Push

```sh
git push origin main
```

The repo belongs to the `thomaskejser` GitHub account.
If the push gets a 403 or a password prompt, check `gh auth status`: the active account is often `tkejser-floe`.
Never run `gh auth switch` yourself; ask Thomas to run `! gh auth switch --user thomaskejser`, then push again.

## 4. Deploy

Deploy from a fresh `npm run build`.
The deploy uploads `build/` over FTPS and unpacks it on the server; it only adds and overwrites files, never deletes them.
It needs `DOGS_FTP_HOST`, `DOGS_FTP_USER`, `DOGS_FTP_PWD` and `DOGS_SITE_URL`; `DOGS_FTP_PORT` defaults to 21.
Check they are set without printing their values.
Always run it with a 240-second limit.

**macOS** (variables in `~/.zshenv`):

```sh
( node scripts/deploy-cpanel.ts DOGS 2>&1 & P=$!; ( sleep 240; kill $P 2>/dev/null && echo KILLED ) & W=$!; wait $P; echo "exit $?"; kill $W 2>/dev/null )
```

**Windows** (variables are Windows User environment variables; Node is in `C:\Program Files\nodejs`).
A session started before the variables were set won't see them, so load them first.
Run it in PowerShell:

```powershell
$env:Path = "C:\Program Files\nodejs;$env:Path"
foreach ($n in 'DOGS_FTP_HOST','DOGS_FTP_USER','DOGS_FTP_PWD','DOGS_FTP_PORT','DOGS_SITE_URL') {
  $v = [Environment]::GetEnvironmentVariable($n, 'User'); if ($v) { Set-Item "env:$n" $v }
}
$out = Join-Path $env:TEMP 'dogs-deploy'
$p = Start-Process node -ArgumentList 'scripts/deploy-cpanel.ts','DOGS' -NoNewWindow -PassThru `
  -RedirectStandardOutput "$out.out" -RedirectStandardError "$out.err"
if (-not $p.WaitForExit(240000)) { Stop-Process $p -Force; 'KILLED' }
Get-Content "$out.out", "$out.err"
```

Success prints `deployed to https://dogs.kejser.org`.

### Known failures

- `530 Login authentication failed`: wrong user or password. The FTP user is `doggy@dogs.kejser.org`.
  Don't retry more than once; repeated failures can get the IP blocked by cPanel.
- `build/.htaccess would remove cPanel's PHP handler`: if `static/.htaccess` already has the block, the file has CRLF line endings.
  `.gitattributes` keeps the working tree at LF, but a checkout made before it existed may still be CRLF; see Windows below.

## Windows notes

- A checkout made before `.gitattributes` existed has CRLF files, which fail `npm run lint` and the `.htaccess` check.
  On a clean tree, fix it with `git ls-files -z | xargs -0 rm -f && git checkout -- .`.
- `npm test` needs Playwright's Chromium once per machine: `npx playwright install chromium`.

## 5. Verify

Check that the front page and every page changed in this deploy return 200:

```sh
curl -s -o /dev/null -w '%{http_code}\n' https://dogs.kejser.org/faq/<slug>
```

Report what was committed, the push result, and the page checks.
