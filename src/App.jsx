import { motion } from "framer-motion";
import demoImage from "./assets/demo.png";
import logo from "./assets/logo.png";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center px-6 text-center min-h-screen"
      >
        <div className="flex flex-col items-center">
          <motion.img
            src={logo}
            alt="ZonePredictor logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-28 md:w-36 mb-6 drop-shadow-[0_0_25px_rgba(34,197,94,0.6)]"
          />
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            ZonePredictor
          </h1>
        </div>


        <p className="mt-6 max-w-2xl text-lg text-zinc-300">
          AI-powered PUBG/BGMI zone prediction system trained directly on
          tournament match videos — built to understand zone movement patterns
          when no official game APIs exist.
        </p>

        <a
          href="https://t.me/YOUR_BOT_USERNAME"
          target="_blank"
          rel="noreferrer"
          className="mt-10 inline-block rounded-lg bg-green-500 px-6 py-3 text-lg font-semibold text-black hover:bg-green-400 transition shadow-[0_0_20px_rgba(34,197,94,0.5)]"
        >
          Try on Telegram
        </a>

        <p className="mt-6 text-sm text-zinc-500">
          Early-stage project · Looking for feedback & collaboration
        </p>
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-6 py-20 bg-zinc-950"
      >
        <h2 className="text-3xl font-bold text-center">How It Works</h2>

        <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-xl font-semibold">1️⃣ Video Input</h3>
            <p className="mt-4 text-zinc-400">
              Tournament map stream footage is used as the primary data source
              since no official game APIs are available.
            </p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-xl font-semibold">2️⃣ AI Pattern Learning</h3>
            <p className="mt-4 text-zinc-400">
              The system learns historical zone movement patterns across
              different match stages.
            </p>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-xl font-semibold">3️⃣ Next Zone Prediction</h3>
            <p className="mt-4 text-zinc-400">
              Based on the current zone, the model predicts where the next safe
              zone is most likely to appear.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Demo Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-6 py-20"
      >
        <h2 className="text-3xl font-bold text-center">See It In Action</h2>

        <div className="mt-12 max-w-5xl mx-auto grid gap-12 md:grid-cols-2 items-center">
          <div>
            <ol className="space-y-6 text-zinc-300">
              <li>
                <span className="text-green-400 font-semibold">Step 1:</span>{" "}
                Take a screenshot where the current safe zone is clearly visible —
                from a tournament map stream or a player POV during a live or recorded match.
              </li>
              <li>
                <span className="text-green-400 font-semibold">Step 2:</span>{" "}
                Send the screenshot to the ZonePredictor Telegram bot.
              </li>
              <li>
                <span className="text-green-400 font-semibold">Step 3:</span>{" "}
                Receive the AI-predicted next safe zone instantly.
              </li>
            </ol>
          </div>
          <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
            <img
              src={demoImage}
              alt="Zone prediction demo"
              className="w-full h-full object-cover"
            />
            <div className="p-4 bg-zinc-900 text-sm text-zinc-400 border-t border-zinc-800">
              Example output from the Telegram bot showing predicted next zone.
            </div>
          </div>
        </div>
      </motion.section>

      {/* Accuracy Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-6 py-20 bg-zinc-950"
      >
        <h2 className="text-3xl font-bold text-center">Current Model Accuracy</h2>

        <div className="mt-12 max-w-4xl mx-auto">
          <ul className="space-y-4 text-zinc-300 text-lg">
            <li>Zone 1 → 2 : <span className="text-green-400 font-semibold">78%</span></li>
            <li>Zone 2 → 3 : <span className="text-green-400 font-semibold">76%</span></li>
            <li>Zone 3 → 4 : <span className="text-yellow-400 font-semibold">65%</span></li>
            <li>Zone 4 → 5 : <span className="text-yellow-400 font-semibold">52%</span></li>
            <li>Other transitions: below 50%</li>
          </ul>

          <p className="mt-10 text-zinc-400 leading-relaxed">
            Accuracy decreases in later zones because many matches end before the
            final circles form. The current model has been trained on approximately
            200 tournament videos. Performance is expected to improve significantly
            as the training dataset grows toward 10,000+ matches.
          </p>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-6 py-20"
      >
        <h2 className="text-3xl font-bold text-center">Get in Touch</h2>

        <p className="mt-4 text-center text-zinc-400 max-w-2xl mx-auto">
          I'm looking for feedback, testing partners, and potential
          collaborations in esports analytics and AI research.
        </p>

        <form
          name="contact"
          method="POST"
          data-netlify="true"
          className="mt-12 max-w-xl mx-auto space-y-6"
        >
          <input type="hidden" name="form-name" value="contact" />

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-green-400"
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            required
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-green-400"
          />

          <textarea
            name="message"
            placeholder="Your Message"
            rows="4"
            required
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-green-400"
          ></textarea>

          <button
            type="submit"
            className="w-full rounded-lg bg-green-500 px-6 py-3 font-semibold text-black hover:bg-green-400 transition shadow-[0_0_20px_rgba(34,197,94,0.4)]"
          >
            Send Message
          </button>
        </form>
      </motion.section>

    </div>
  );
}

export default App;