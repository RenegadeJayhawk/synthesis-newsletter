export default function ContactPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-3xl text-center">
        <h1 className="text-3xl font-bold mb-4">Contact</h1>
        <p className="text-sm text-muted-foreground mb-6">Email us at hello@synthesis.ai</p>
        <form className="space-y-4 max-w-md mx-auto">
          <div>
            <label htmlFor="contact-name" className="sr-only">Your name</label>
            <input id="contact-name" name="name" className="w-full p-3 rounded bg-slate-100" placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="contact-email" className="sr-only">Your email</label>
            <input id="contact-email" name="email" type="email" className="w-full p-3 rounded bg-slate-100" placeholder="Your email" />
          </div>
          <div>
            <label htmlFor="contact-message" className="sr-only">Message</label>
            <textarea id="contact-message" name="message" className="w-full p-3 rounded bg-slate-100" placeholder="Message" rows={4} />
          </div>
          <button className="w-full py-3 rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white">Send</button>
        </form>
      </div>
    </main>
  )
}
