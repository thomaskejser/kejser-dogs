# Notes for agents working on this repo

The site is "Dogs: A human companion's manual", live at https://dogs.kejser.org.
Thomas Kejser is the author and owner.
`README.md` describes the content format, front matter and commands; this file holds the editorial rules and how Thomas likes to work.

## Editorial rules

- **Thomas decides which articles exist.**
  Never write a new FAQ article, or a draft, unless he asks for that specific article.
  When research turns up material that fits no article, report it and suggest topics.
  Editing existing articles to match their references is fine.
- **Voice:** the author speaks as "I" ("I could not find…"), never the editorial "we".
  "We" is fine for people in general.
- **Style:** follow the existing articles.
  - The `#` heading is the question.
  - The `summary` is a direct short answer; honest uncertainty is a fine answer.
  - One sentence per line.
  - End with `## Related questions`.
  - Links between content files are relative `.md` paths.
- **Categories** are fixed in `src/lib/faq.ts`: "Nutrition and feeding", Aging, Care, Breeds, Behavior.
  Only Thomas changes them.
- **No pseudoscience.**
  Thomas removed a telepathy study (Sheldrake) and never wants psychic-pet material cited.

## Source rule

Published on the about page under "How I choose sources": peer-reviewed only, no industry funding, traceable by DOI or PMID, honest about gaps.

- **Exclude, never just flag,** studies funded by, or written by employees of, companies selling products related to the topic (pet food, supplements, medicines, grooming, dental, allergy tests, devices), and every claim that rests on them.
  Where that leaves a gap, say so in the article in one short sentence.
- **Read the funding statement** in the full text before citing.
  If it can't be read after a real attempt, leave the paper out and add it to `src/content/pages/papers-i-am-looking-for.md` (DOI link and what is needed).
  When one of those papers is later read and passes, cite it and remove it from that page.
- **Verify every DOI or PMID** resolves to the paper cited.

### Thomas's rulings on edge cases

| Case                                                                                                                | Ruling                 |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Pet insurers (Agria, Anicom)                                                                                        | Fail                   |
| Kennel-club charities (Kennel Club Charitable Trust, Norwegian Kennel Club research foundation)                     | Pass                   |
| Industry-employed author, topic touches the employer's products                                                     | Fail                   |
| Industry-employed author, unrelated topic (a Mars-owned VCA vet on poisoning)                                       | Pass                   |
| Indirect industry money: publication fees, industry-funded posts, consultancies, trade bodies                       | Fail                   |
| Funding unreadable, or an anonymous funder                                                                          | Fail                   |
| Full text read, no funding statement, no industry author                                                            | Pass ("none declared") |
| Clean study funding, authors with personal consulting or advisory ties                                              | Pass                   |
| Agria thanked only "for supporting VetCompass", study funded by others                                              | Pass                   |
| Non-profit foundations, vet-clinic employers, non-profit arms of dog-service businesses (Dogtopia)                  | Pass                   |
| Non-pet company selling the product under study (Hershey on chocolate)                                              | Fail                   |
| In-kind donation of the product under study                                                                         | Fail                   |
| In-kind donation unrelated to the topic (Kong toys in a urine-sniffing study)                                       | Pass                   |
| Technical support from an unrelated equipment maker (EMMS)                                                          | Pass                   |
| Clean study that feeds a commercial diet, no donation stated (Royal Canin diet in Sofou 2025)                       | Pass                   |
| Research-agency study thanking an allergy-test company for running tests (Premrov Bajuk 2021)                       | Pass                   |
| Berns 2015 (authors later held equity in Dog Star Technologies, not declared in the paper)                          | Pass                   |
| Indrebø 2007 (conference talk in a journal supplement)                                                              | Keep                   |
| Product reviews (e.g. Stomodine): maker-funded studies may be read if peer-reviewed and solid, and must be labelled | Allowed, one-off       |

Not yet ruled:

- **Funder known only from Crossref or OpenAlex records, full text unread** (McGuire 2018, Wirant & McGuire 2004, Yeon 1999, Benediktová 2025, Lisberg & Snowdon 2011).
  Treated as unreadable, so left out, until Thomas decides.
- **Della Rocca 2023** (Italian Helsinki pain index): no external funding, but one author consults for CeDIS, possibly linked to a supplement maker.
  Left out.

## Research workflow

- Research runs in background agents; each brief must state the source rule and the rulings above, and ask for funding quotes, verified DOIs, and lists of excluded and unreadable papers.
- Summarise reports for Thomas before writing; he decides which articles to write.
- Paywalled publisher pages (Wiley, Elsevier) block automated access; Thomas's Chrome passes the bot check but has no subscription, so only abstract pages are readable.
  Pirate sites (Sci-Hub, LibGen) are never used.

## Working with Thomas

- **Commit, push and deploy only when he asks**, usually as "commit, push and deploy".
- Stage explicit file paths only, read `git diff --cached --name-status` before every commit, one author per commit, with the session trailers.
- Pull with `git pull --rebase` at session start and after a long pause.
- Never print credentials.
- Don't start, stop or kill a dev server or port you didn't open.
- Skill changes go through the session named "Skills", by message; never edit `~/source/kejser-skill` from here.

## Checks, push and deploy

- Checks: `npm run build` (fails on broken links), `npm test`, `npm run lint`, `npm run check`.
- Push: `git push origin main`.
  The repo belongs to the `thomaskejser` GitHub account, but the active `gh` account is often `tkejser-floe` (Thomas's Floe work), which gets a 403 or a password prompt here.
  `gh auth git-credential` only serves the active account, so pinning a username in git config does not help.
  Never run `gh auth switch` yourself, since it changes the login for every session; ask Thomas to run `! gh auth switch --user thomaskejser`, then push.
- Deploy, after a build, with a time limit:

  ```sh
  ( node scripts/deploy-cpanel.ts DOGS 2>&1 & P=$!; ( sleep 240; kill $P 2>/dev/null && echo KILLED ) & W=$!; wait $P; echo "exit $?"; kill $W 2>/dev/null )
  ```

  It needs `DOGS_FTP_HOST`, `DOGS_FTP_USER`, `DOGS_FTP_PWD`, `DOGS_FTP_PORT` and `DOGS_SITE_URL` in the environment (`~/.zshenv`).
  The deploy only adds and overwrites files; it never deletes old ones.
  Check the new pages return 200 afterwards.

## Open threads (2026-10-23)

- **Contact channel:** the papers page and the food-allergy article invite readers with PDFs to get in touch, but the site has no contact address yet; Thomas chose to leave it vague for now.
- **Gillis 1999** (dogs recognising their mother's and carer's scent after months apart): only available as an Internet Archive loan (https://archive.org/details/advancesinchemic0000unse_u3z2); Thomas was to borrow it and check its funding.
  If it passes, add it to `how-long-do-dogs-remember-a-person.md`.
- **Hydrolysed diets:** Jackson 2003 is the key unreadable paper; Ricci 2010 was read and fails (Nestlé Purina).
- **Article ideas offered, not commissioned:**
  - When is licking or scratching excessive?
  - Is my dog drinking too much?
  - Is eating grass or poo a sign of illness?
  - Behaviour changes in older dogs: ageing or dementia?
  - Neutering age.
  - Dog years.
  - Female versus male lifespan.
  - Feeding frequency.
