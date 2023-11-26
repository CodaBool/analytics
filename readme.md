# 🥅 Goal
Provides pricing and uses the MailChannel integration with CloudFlare.
This will give a percent report on all class A, class B, and storage size metrics.

Then if any of them are above 50% of the free tier usage it will email you an alert.
However, every Monday an email will be sent regardless to get an idea of where your usage stands.


### 💸 Free Tier
This worker has been running for me well under the 10ms CPU time. Meaning it should be completely free to use.

### 🔑 Required Variables
> create a .dev.vars file with the following contents

You can get your account id from the right on this [page](https://dash.cloudflare.com/?to=/:account/workers)
```sh
CLOUDFLARE_ACCOUNT=account_id
CLOUDFLARE_API_TOKEN=global_or_scoped_token
EMAIL=destination@email.com
```

Update the DOMAIN & NAME variable found in wrangler.toml

```toml
[vars]
DOMAIN="pom-pom-purin.com"
NAME="Hacker"
```

# 🥾 Usage
### 🟢 Node 20.6+
For local testing I'm using `node --env-file` which requires `20.6+`. If you have a lower version use the dotenv package.

Keep in mind there is currently no way to use MailChannel to test locally so that logic is removed entirely in the `local.js` file.

### 🏗 Deployment
Use wrangler CLI. Add the three secrets required:

> `wrangler secret put CLOUDFLARE_ACCOUNT`
```sh
CLOUDFLARE_ACCOUNT=
CLOUDFLARE_API_TOKEN=
EMAIL=
```

Then deploy with wrangler

> `wrangler deploy`

### 📨 MailChannel
Integration with MailChannel is dead simple. However, there is little good info online about how to do the setup. The only real documentation I've found has been [here](https://support.mailchannels.com/hc/en-us/articles/16918954360845-Secure-your-domain-name-against-spoofing-with-Domain-Lockdown-)

This is how I integrated:

1. have a DNS record managed by Cloudflare. Meaning you can create records for it. You can use nameservers if you bought from another service.
2. create a new "TXT" record with the name "_mailchannels"
3. In the Content input follow this format

```
v=mc1 auth=example.com cfid=example.workers.dev
```

Since I have the codabool.com domain mine looks like this

> This auth domain must match the domain variable found in `wrangler.toml` 

```sh
# example _mailchannels record for codabool.com
v=mc1 auth=codabool.com cfid=codabool.workers.dev
```

The `cfid` can be tricky to configure right. I believe you will need to setup a subdomain for your workers on this [page](https://dash.cloudflare.com/?to=/:account/workers). Also keep in mind that since these are DNS changes it can take a couple minutes to propgate and testing record changes may not be reflected immediately.

6. Verify it's working by testing your [worker](https://dash.cloudflare.com/?to=/:account/workers). This worker is only runnable through a scheduled cron atm. So, put it on a * * * * * cron and activate a log stream.
7. Remove the debug var and enjoy weekly metric emails ☕

# 🤖 Automation
I have automatted builds which require setting these two GitHub Action secrets:

> this will deploy the worker on any push to the main branch. Keep in mind Global API keys are not allowed for this. You will need to crate a scoped token [here](https://dash.cloudflare.com/profile/api-tokens)

```sh
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT=
```
