import { useCallback, useEffect, useRef, useState } from "react";

import example1 from "../assets/test1.jpg";
import example2 from "../assets/test2.jpg";
import { predictZone, ratePrediction } from "../api/client";
import { prepareImageForUpload } from "../lib/image";
import { Section, SectionHeading } from "./Section";

/**
 * Extra guidance for the refusals a user can actually act on. Everything else
 * falls through to the server's own sentence.
 */
const HINTS = {
  MAP_NOT_SUPPORTED:
    "ZonePredictor currently covers Erangel and Miramar only. Support for Vikendi and Sanhok has been retired.",
  ZONE_NOT_DETECTED:
    "Make sure the white circle of the current safe zone is fully visible in the screenshot.",
  MAP_NOT_MATCHED:
    "The minimap could not be matched. Crop the screenshot to the map itself, without overlays covering it.",
  FILE_TOO_LARGE: "Try a screenshot instead of a full-resolution photo.",
};

/** Matches PredictionLog.RATINGS on the backend. */
const RATINGS = [
  { value: "spot_on", label: "Spot on" },
  { value: "close", label: "Close" },
  { value: "way_off", label: "Way off" },
];

export function Predictor({ backendStatus }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hint, setHint] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [predictionId, setPredictionId] = useState(null);
  const [rating, setRating] = useState(null);
  const [ratingFailed, setRatingFailed] = useState(false);

  // Object URLs are not garbage collected on their own — hold the live ones so
  // they can be revoked when replaced or when the component unmounts.
  const previewUrlRef = useRef(null);
  const resultUrlRef = useRef(null);
  const inputRef = useRef(null);

  const showResult = useCallback((url) => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = url;
    setResult(url);
  }, []);

  const showPreview = useCallback((url) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = url;
    setPreviewUrl(url);
  }, []);

  useEffect(
    () => () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    []
  );

  const chooseFile = useCallback(
    (next) => {
      if (!next) return; // dialog cancelled — keep the current selection
      setFile(next);
      setError(null);
      setHint(null);
      setPredictionId(null);
      setRating(null);
      setRatingFailed(false);
      showResult(null);
      showPreview(URL.createObjectURL(next));
    },
    [showPreview, showResult]
  );

  const reset = () => {
    setFile(null);
    setError(null);
    setHint(null);
    setPredictionId(null);
    setRating(null);
    setRatingFailed(false);
    showResult(null);
    showPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setHint(null);

    try {
      const processed = await prepareImageForUpload(file);
      const { blob, predictionId: id } = await predictZone(
        processed,
        file.name || "screenshot.jpg"
      );
      setPredictionId(id);
      setRating(null);
      setRatingFailed(false);
      showResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
      setHint(HINTS[err?.code] ?? null);
      showResult(null);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (value) => {
    if (!predictionId || rating) return;
    // Optimistic: the thank-you appears immediately. Feedback failing is not
    // something to interrupt someone with — they already have their answer.
    setRating(value);
    setRatingFailed(false);
    try {
      await ratePrediction(predictionId, value);
    } catch {
      setRatingFailed(true);
    }
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer?.files?.[0]);
  };

  return (
    <Section id="predict" tone="raised">
      <SectionHeading eyebrow="Live demo" title="Predict the next zone">
        Upload a screenshot with the current safe zone visible. You get it back
        with the projected next circle drawn on.
      </SectionHeading>

      <div className="mx-auto mt-12 max-w-2xl">
        {/* Drop zone */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-zinc-900/40 p-6 text-center backdrop-blur-sm transition ${
            dragging
              ? "border-green-400 bg-green-500/5"
              : "border-zinc-700 hover:border-green-400"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => chooseFile(e.target.files?.[0])}
            className="hidden"
          />

          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Selected screenshot"
                className="max-h-28 rounded-lg border border-zinc-800 object-contain"
              />
              <p className="mt-3 max-w-full truncate text-sm font-medium text-green-400">
                {file?.name}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Click or drop another file to replace it
              </p>
            </>
          ) : (
            <>
              <span aria-hidden="true" className="text-3xl">
                🗺️
              </span>
              <p className="mt-3 text-sm text-zinc-300">
                Drop a screenshot here, or click to browse
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                PNG or JPG · Erangel and Miramar
              </p>
            </>
          )}
        </label>

        {/* Examples */}
        <p className="mt-6 text-center text-sm text-zinc-500">
          Not sure what to upload? See{" "}
          <a
            href={example1}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 underline-offset-4 transition hover:underline"
          >
            example 1
          </a>{" "}
          or{" "}
          <a
            href={example2}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 underline-offset-4 transition hover:underline"
          >
            example 2
          </a>
          .
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className={`rounded-lg px-8 py-3.5 font-semibold text-black shadow-lg transition-all duration-300 ${
              !file || loading
                ? "cursor-not-allowed bg-green-500/50"
                : "bg-green-500 shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:bg-green-400"
            }`}
          >
            {loading ? "Processing…" : "Predict Next Zone"}
          </button>

          {file && !loading && (
            <button
              onClick={reset}
              className="rounded-lg border border-zinc-700 px-6 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {backendStatus === "offline" && !loading && (
          <p className="mt-4 text-center text-xs text-amber-300/80">
            Heads up: the prediction server is currently unreachable, so this may
            fail.
          </p>
        )}

        {loading && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-400 border-t-transparent" />
            <p className="text-sm text-zinc-500">
              Locating the current zone and running the model…
            </p>
            <p className="text-xs text-zinc-600">
              This can take up to half a minute. Keep the tab open.
            </p>
          </div>
        )}

        {error && !loading && (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-center"
          >
            <p className="text-sm leading-relaxed text-red-200">{error}</p>
            {hint && <p className="mt-2 text-xs text-red-300/80">{hint}</p>}
            <button
              onClick={handleUpload}
              className="mt-3 text-sm font-medium text-red-200 underline underline-offset-4 transition hover:text-white"
            >
              Try again
            </button>
          </div>
        )}

        {result && !loading && (
          <div className="mt-12 text-center">
            <h3 className="font-semibold text-green-400">Predicted next zone</h3>
            <img
              src={result}
              alt="Prediction result"
              className="mx-auto mt-4 max-w-full rounded-xl border border-zinc-800 shadow-2xl"
            />
            <a
              href={result}
              download="zonepredictor-result.jpg"
              className="mt-4 inline-block text-sm text-green-400 underline-offset-4 hover:underline"
            >
              Download image
            </a>

            {/* One click, three options. Anything longer and almost nobody
                answers; a 5-point scale mostly collects 3s. */}
            {predictionId && (
              <div className="mx-auto mt-8 max-w-md rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-4">
                {rating ? (
                  <p className="text-sm text-zinc-400">
                    {ratingFailed
                      ? "Could not save that — thanks for trying."
                      : "Thanks. Feedback like this is what improves the models."}
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-zinc-300">
                      How close was this to the real next zone?
                    </p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {RATINGS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => submitRating(option.value)}
                          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:border-green-400 hover:text-white"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <p className="mt-10 text-center text-xs leading-relaxed text-zinc-600">
          Uploaded screenshots are kept to improve the model. Do not upload
          anything you would not want stored.
        </p>
      </div>
    </Section>
  );
}
