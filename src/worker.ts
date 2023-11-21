export default {
  async fetch(request, env) {
    const resp = await fetch(
			'https://api.mailchannels.net/tx/v1/send', {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: 'codabool@pm.me', name: 'CodaBool' }],
            },
          ],
          from: {
            email: 'sender@codabool.com',
            name: 'Workers - MailChannels integration',
          },
          subject: 'Look! No serverswssssssss',
          content: [
            {
              type: 'text/plain',
              value: 'And no email service accounts and all for free too!',
            },
          ],
        })
			}
		)

    if (!resp.ok || resp.status > 299) {
      throw new Error(`Error sending email: ${resp.status} ${resp.statusText}`)
    }

    return new Response("sent")
  }
}