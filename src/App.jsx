import { motion } from "framer-motion";
import demoImage from "./assets/demo.png";
import logo from "./assets/logo.png";
import { useState } from "react";
import example1 from "./assets/test1.jpg";
import example2 from "./assets/test2.jpg";

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("file", image); // IMPORTANT: must match Flask key

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("https://api.zonepredictor.com/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);
      setResult(imageUrl);
    } catch (err) {
      console.error(err);
      alert("Prediction failed.");
    }

    setLoading(false);
  };


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
        <div className="w-28 md:w-36 h-28 md:h-36 mb-6 flex items-center justify-center">
          <motion.img
            src={logo}
            alt="ZonePredictor logo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(34,197,94,0.6)]"
          />
        </div>
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
          href="#live-upload"
          className="mt-10 inline-block rounded-lg bg-green-500 px-6 py-3 text-lg font-semibold text-black hover:bg-green-400 transition shadow-[0_0_20px_rgba(34,197,94,0.5)]"
        >
          Try It Now
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

      {/* Accuracy Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-6 py-20"
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
      
      {/* Live Upload Section */}
      <motion.section
        id ="live-upload"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="px-6 py-20 bg-zinc-950"
      >
        <h2 className="text-3xl font-bold text-center">Try It Live</h2>

        <p className="mt-4 text-center text-zinc-400 max-w-2xl mx-auto">
          Upload a screenshot showing the current safe zone, and the AI will predict
          where the next zone is likely to appear.
        </p>

        <div className="mt-12 max-w-xl mx-auto">

          {/* Upload Box */}
          <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-green-400 transition bg-zinc-900/40 backdrop-blur-sm">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="hidden"
            />
            <p className="text-zinc-400 text-sm">
              Click to upload screenshot
            </p>
            {image && (
              <p className="mt-3 text-green-400 text-sm font-medium">
                {image.name}
              </p>
            )}
          </label>
          {/* Example Links */}
          <div className="mt-10 text-center">
            <p className="text-zinc-500 text-sm mb-4">
              Not sure what to upload? View example screenshots:
            </p>

            <div className="flex justify-center gap-6 text-sm">
              <a
                href={example1}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline transition"
              >
                Example 1
              </a>

              <a
                href={example2}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline transition"
              >
                Example 2
              </a>
            </div>
          </div>
          {/* Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleUpload}
              disabled={!image || loading}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg
                ${loading
                  ? "bg-green-500/60 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-400 shadow-[0_0_25px_rgba(34,197,94,0.5)]"
                }
                text-black`}
            >
              {loading ? "Processing..." : "Predict Next Zone"}
            </button>
          </div>

          {/* Loader */}
          {loading && (
            <div className="mt-8 flex justify-center">
              <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="mt-12 text-center">
              <h3 className="text-green-400 font-semibold mb-4">
                Predicted Zone
              </h3>
              <img
                src={result}
                alt="Prediction result"
                className="rounded-xl border border-zinc-800 shadow-2xl max-w-full mx-auto"
              />
            </div>
          )}

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
          action="/thank-you.html"
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