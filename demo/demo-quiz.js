// The demo page's quiz: the rounds, the questions, the answers and the summary. Split from demo.js; the panels share one state object (demo-core.js).

import { cityOptions } from "./city-names.js";
import {
  $,
  calls,
  el,
  featureOptions,
  inPart,
  language,
  live,
  nameIn,
  placeOf,
  QUIZ_DEEPEST,
  ROUND,
  regionOf,
  remember,
  STYLES,
  say,
  seg,
  state,
  WATER,
} from "./demo-core.js";
import { renderFeatures } from "./demo-info.js";
import { ensureLayer, partTones, setTones, showPart } from "./demo-maps.js";
import { downloadRow, viewName } from "./demo-save.js";
import { featureKindName, findQuestion, groupMap, seededRandom } from "./dist/index.js";
import { toMarkdown, toSql } from "./downloads.js";
import { keep } from "./keep.js";
import { hasKanjiReading, isNameOf, isReadingOf, nextStreak, roundOrder, toCsv, toJson, toText } from "./tools.js";

// ---- the quiz ----------------------------------------------------------------------------------------------
export const bestKey = () => `chizu.best.${state.map.id}.${state.part?.key ?? "all"}.${state.quiz.style}`;

/** The places a round may ask about: the part's, and for readings only those whose names have kanji. */
export function quizPool() {
  // Water big enough to press on the whole map: a lake a pixel across is not a question, on a phone.
  const pressable = (feature) =>
    Math.max(feature.bbox[2] - feature.bbox[0], feature.bbox[3] - feature.bbox[1]) >=
    Math.max(state.map.width, state.map.height) * 0.02;
  if (state.quiz.style === "water")
    return (state.layer?.features ?? [])
      .filter((feature) => WATER.has(feature.group) && pressable(feature))
      .map((feature) => feature.code);
  const regions = inPart();
  return (state.quiz.style === "kana" ? regions.filter(hasKanjiReading) : regions).map((region) => region.code);
}

export async function startRound() {
  const quiz = state.quiz;
  if (quiz.style === "water") await ensureLayer();
  const pool = quizPool();
  quiz.order = pool.length >= 4 ? roundOrder(pool, ROUND, seededRandom(quiz.seed)) : [];
  quiz.index = 0;
  quiz.results = [];
  quiz.streak = { current: 0, best: Number(keep.get(bestKey())) || 0 };
  quiz.note =
    pool.length >= 4
      ? null
      : state.quiz.style === "water"
        ? say("waterNeeds")
        : state.quiz.style === "kana" && inPart().length >= 4
          ? say("kanaNeeds")
          : say("quizNeeds");
  remember({ seed: quiz.seed, style: quiz.style });
  $("quiz-summary").hidden = true;
  askQuestion();
}

export function askQuestion() {
  const quiz = state.quiz;
  quiz.answered = false;
  quiz.question = null;
  if (quiz.note !== null || quiz.index >= quiz.order.length) {
    setTones(partTones(), { selected: null, selectable: false, callouts: undefined });
    renderQuestion();
    return;
  }
  const target = quiz.order[quiz.index];
  const random = seededRandom(quiz.seed * 7919 + quiz.index);
  const pool = quizPool();
  quiz.question =
    quiz.style === "choose"
      ? findQuestion(groupMap(state.map, pool), target, random)
      : { target, choices: [], answerIndex: -1 };
  if (quiz.style === "find" || quiz.style === "water") {
    // The place is not lit: finding it is the question. The map shows the part whole, and a press answers.
    setTones(partTones(), { selected: null, selectable: true, fit: false, callouts: undefined });
    showPart();
  } else {
    // The place is lit by a tone, never "chosen": a chosen place would be read out, and that is the answer.
    setTones({ ...partTones(), [target]: "selected" }, { selected: null, selectable: false, callouts: undefined });
    live.mount.show([target]);
    // A question keeps some of the map round the place in view: its neighbours are half the clue. Closer than 6× only
    // the place itself would show.
    while (live.mount.view().zoom > QUIZ_DEEPEST) live.mount.zoomBy(-1);
  }
  renderQuestion();
  if (quiz.style === "type" || quiz.style === "kana") {
    const input = $("answer");
    input.value = "";
    if (document.activeElement?.closest?.("#panel-quiz")) input.focus();
  }
}

export const shownName = (region) => region.nameShortJa ?? region.nameJa ?? region.name;

export function questionText() {
  const quiz = state.quiz;
  const what = state.map.kind === "world" ? say("whatCountry") : say("whatRegion");
  const region = placeOf(quiz.question.target);
  if (quiz.style === "water") return say("questionWater", nameIn(region), featureKindName(region.kind, language.lang));
  if (quiz.style === "type") return say("questionType", what);
  if (quiz.style === "kana") return say("questionKana", shownName(region));
  if (quiz.style === "find") return say("questionFind", nameIn(region));
  return say("question", what);
}

export function renderQuestion() {
  const quiz = state.quiz;
  const panel = $("question");
  const choices = $("choices");
  const typed = $("typed");
  seg($("styles"), STYLES, quiz.style, chooseStyle, (value) => say("styles")[value]);
  $("score").textContent = say(
    "score",
    quiz.results.filter((result) => result.result === "right").length,
    quiz.results.length,
  );
  $("streak").textContent = say("streak", quiz.streak.current);
  $("streak").dataset.lit = String(quiz.streak.current >= 3);
  $("best").textContent = say("best", quiz.streak.best);
  $("progress").textContent = quiz.order.length
    ? say("round", Math.min(quiz.answered ? quiz.index : quiz.index + 1, quiz.order.length), quiz.order.length)
    : "";
  if (quiz.note !== null) {
    panel.textContent = quiz.note;
    delete panel.dataset.result;
    choices.replaceChildren();
    typed.hidden = true;
    $("next").hidden = true;
    return;
  }
  if (quiz.question === null) {
    choices.replaceChildren();
    typed.hidden = true;
    $("next").hidden = true;
    renderSummary();
    return;
  }
  if (!quiz.answered) {
    panel.textContent = questionText();
    delete panel.dataset.result;
  }
  const map = state.map;
  choices.replaceChildren(
    ...quiz.question.choices.map((code) => {
      const region = regionOf(code);
      const reading =
        language.lang === "ja" && region.reading && region.reading !== shownName(region) ? ` (${region.reading})` : "";
      return el("button", {
        type: "button",
        class: "fam-button",
        "data-code": code,
        "data-testid": `choice-${code}`,
        disabled: quiz.answered,
        text: nameIn(region) + reading,
        on: { click: () => answer(code, nameIn(region)) },
      });
    }),
  );
  typed.hidden = !(quiz.style === "type" || quiz.style === "kana");
  $("answer").setAttribute("lang", quiz.style === "kana" ? "ja" : language.lang);
  $("answer").placeholder = quiz.style === "kana" ? say("answerKanaPlaceholder") : say("answerPlaceholder");
  $("answer").disabled = quiz.answered;
  $("check").disabled = quiz.answered;
  $("skip").disabled = quiz.answered;
  $("next").hidden = false;
  $("next").disabled = !quiz.answered;
  void map;
}

export function chooseStyle(style) {
  state.quiz.style = style;
  void startRound();
}

export function chooseCities(value) {
  state.cities = value;
  remember({ cities: value ? "on" : null });
  calls.settings();
  live.mount.set(cityOptions(value));
}

export function chooseFeatures(value) {
  state.features = value;
  remember({ features: value === "off" ? null : value });
  calls.settings();
  void ensureLayer().then(() => {
    live.mount.set(featureOptions());
    renderFeatures();
    calls.renderCode();
  });
}

/** Judge an answer: `code` is the place chosen or pressed (or null for a typed one), `said` the words given. */
export function answer(code, said, verdict = null) {
  const quiz = state.quiz;
  if (quiz.answered || quiz.question === null) return;
  quiz.answered = true;
  const target = quiz.question.target;
  const region = placeOf(target);
  const result = verdict ?? (code === target ? "right" : "wrong");
  quiz.streak = nextStreak(quiz.streak, result === "right");
  if (quiz.streak.best > (Number(keep.get(bestKey())) || 0)) keep.set(bestKey(), String(quiz.streak.best));
  quiz.results.push({
    n: quiz.index + 1,
    code: target,
    iso: region.iso ?? "",
    place: nameIn(region),
    reading: region.reading ?? "",
    given: said,
    result,
  });
  const tones = { ...partTones(), [target]: "correct" };
  if (result === "wrong" && code && code !== target) tones[code] = "wrong";
  setTones(tones, { selected: null, selectable: false });
  if (quiz.style === "find" || quiz.style === "water")
    live.mount.show(code && code !== target ? [target, code] : [target]);
  const panel = $("question");
  const right = quiz.style === "kana" ? `${shownName(region)}（${region.reading}）` : nameIn(region);
  panel.textContent =
    result === "right"
      ? say("right") + right
      : result === "shown"
        ? say("shown", right)
        : say("wrong", right) + (said ? say("youSaid", said) : "");
  panel.dataset.result = result;
  quiz.index += 1;
  renderQuestion();
  if (quiz.index >= quiz.order.length) renderSummary();
  $("next").focus({ preventScroll: true });
}

export function checkTyped(event) {
  event?.preventDefault();
  const quiz = state.quiz;
  if (quiz.answered || quiz.question === null) return;
  const typed = $("answer").value.trim();
  if (typed === "") return;
  const region = regionOf(quiz.question.target);
  const right = quiz.style === "kana" ? isReadingOf(typed, region) : isNameOf(typed, region);
  answer(null, typed, right ? "right" : "wrong");
}

export function nextQuestion() {
  if (state.quiz.index >= state.quiz.order.length) {
    renderSummary();
    return;
  }
  askQuestion();
}

export const resultColumns = () => [
  { key: "n", label: say("colQuestion") },
  { key: "code", label: "code" },
  { key: "iso", label: "iso" },
  { key: "place", label: say("colPlace") },
  { key: "reading", label: say("colReading") },
  { key: "given", label: say("colGiven") },
  { key: "resultText", label: say("colResult") },
];

export function shareLink() {
  const query = new URLSearchParams({
    map: state.mapKey,
    mode: "quiz",
    style: state.quiz.style,
    seed: String(state.quiz.seed),
    lang: language.lang,
  });
  if (state.part) query.set("part", state.part.key);
  return `${location.origin}${location.pathname}?${query.toString()}`;
}

export function renderSummary() {
  const quiz = state.quiz;
  const summary = $("quiz-summary");
  const done = quiz.order.length > 0 && quiz.results.length >= quiz.order.length;
  summary.hidden = !done;
  if (!done) return;
  $("next").hidden = true;
  const rightCount = quiz.results.filter((result) => result.result === "right").length;
  $("summary-text").textContent = say("roundDone", rightCount, quiz.results.length, quiz.streak.best);
  const words = { right: say("resultRight"), wrong: say("resultWrong"), shown: say("resultShown") };
  const rows = quiz.results.map((result) => ({ ...result, resultText: words[result.result] }));
  $("summary-table").replaceChildren(
    el("thead", {}, el("tr", {}, ...resultColumns().map((column) => el("th", { text: column.label })))),
    el(
      "tbody",
      {},
      ...rows.map((row) =>
        el(
          "tr",
          { "data-result": row.result },
          ...resultColumns().map((column) => el("td", { text: String(row[column.key] ?? "") })),
        ),
      ),
    ),
  );
  const title = `${say("roundTable")} · ${state.map.name} · seed ${quiz.seed}`;
  downloadRow($("summary-files"), "download-results", say("download"), [
    {
      format: "csv",
      type: "text/csv",
      name: viewName("quiz", String(quiz.seed)),
      make: () => toCsv(resultColumns(), rows),
    },
    {
      format: "json",
      type: "application/json",
      name: viewName("quiz", String(quiz.seed)),
      make: () =>
        toJson(resultColumns(), rows, {
          map: state.map.id,
          part: state.part?.key ?? null,
          style: quiz.style,
          seed: quiz.seed,
          link: shareLink(),
        }),
    },
    {
      format: "txt",
      type: "text/plain",
      name: viewName("quiz", String(quiz.seed)),
      make: () => toText(`${title}\n${$("summary-text").textContent}\n${shareLink()}`, resultColumns(), rows),
    },
    {
      format: "md",
      type: "text/markdown",
      name: viewName("quiz", String(quiz.seed)),
      make: () => toMarkdown(resultColumns(), rows),
    },
    {
      format: "sql",
      type: "application/sql",
      name: viewName("quiz", String(quiz.seed)),
      make: () => toSql("quiz_results", resultColumns(), rows),
    },
  ]);
  $("share-link").value = shareLink();
}
