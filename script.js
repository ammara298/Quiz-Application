
const bank = [
  {
    q: "Which language structures a web page?",
    options: ["CSS", "HTML", "JavaScript", "SQL"],
    answer: 1
  },
  {
    q: "Which CSS property changes text color?",
    options: ["font-style", "background", "color", "text-size"],
    answer: 2
  },
  {
    q: "Which keyword declares a block-scoped variable?",
    options: ["var", "let", "define", "static"],
    answer: 1
  },
  {
    q: "Which symbol selects a class in CSS?",
    options: ["#", ".", "*", "@"],
    answer: 1
  },
  {
    q: "Which Bootstrap class creates a responsive container?",
    options: [".row", ".btn", ".container", ".text"],
    answer: 2
  },
  {
    q: "Which HTML tag creates a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    answer: 1
  },
  {
    q: "Which method selects an element by ID?",
    options: [
      "getElementById()",
      "queryClass()",
      "getCSS()",
      "selectTag()"
    ],
    answer: 0
  },
  {
    q: "Which CSS feature helps create responsive layouts?",
    options: ["Media queries", "Alerts", "Variables only", "Comments"],
    answer: 0
  }
];

const $ = id => document.getElementById(id);

let questions = [];
let index = 0;
let score = 0;
let time = 60;
let selected = [];
let locked = false;
let timerId;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function startQuiz() {
  clearInterval(timerId);
  questions = shuffle(bank).slice(0, 5);
  index = 0;
  score = 0;
  time = 60;
  selected = [];
  locked = false;

  $("quiz").classList.remove("d-none");
  $("result").classList.add("d-none");
  $("timer").classList.remove("warning");
  $("timer").textContent = "⏱ 60s";

  renderQuestion();

  timerId = setInterval(() => {
    time--;
    $("timer").textContent = `⏱ ${time}s`;

    if (time <= 10) $("timer").classList.add("warning");
    if (time <= 0) finishQuiz();
  }, 1000);
}

function renderQuestion() {
  locked = false;
  const item = questions[index];

  $("counter").textContent =
    `Question ${index + 1} / ${questions.length}`;
  $("question").textContent = item.q;
  $("feedback").textContent = "";
  $("nextBtn").disabled = true;
  $("nextBtn").textContent =
    index === questions.length - 1 ? "Finish ✓" : "Next →";

  $("progress").innerHTML = questions.map((_, i) =>
    `<div class="segment ${i < index ? "done" : ""} ${
      i === index ? "current" : ""
    }" aria-label="Question ${i + 1}"></div>`
  ).join("");

  $("options").replaceChildren();

  item.options.forEach((option, i) => {
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = `${String.fromCharCode(65 + i)}. ${option}`;
    button.onclick = () => chooseAnswer(i);
    $("options").appendChild(button);
  });
}

function chooseAnswer(choice) {
  if (locked) return;
  locked = true;

  const item = questions[index];
  selected[index] = choice;

  if (choice === item.answer) score++;

  [...$("options").children].forEach((button, i) => {
    button.disabled = true;

    if (i === item.answer) button.classList.add("correct");
    if (i === choice && choice !== item.answer) {
      button.classList.add("wrong");
    }
  });

  $("feedback").textContent = choice === item.answer
    ? "✓ Correct answer!"
    : "✗ Incorrect. The correct answer is highlighted.";

  $("feedback").style.color =
    choice === item.answer ? "#198754" : "#dc3545";

  $("progress").children[index].classList.add("done");
  $("nextBtn").disabled = false;
}

function finishQuiz() {
  clearInterval(timerId);

  $("quiz").classList.add("d-none");
  $("result").classList.remove("d-none");
  $("score").textContent = `${score}/${questions.length}`;

  $("summary").textContent =
    `Accuracy: ${Math.round(score / questions.length * 100)}% · ` +
    `${questions.length - score} incorrect or unanswered`;

  $("resultRows").replaceChildren();

  questions.forEach((item, i) => {
    const row = document.createElement("tr");
    const values = [
      `${i + 1}. ${item.q}`,
      selected[i] === undefined
        ? "Not answered"
        : item.options[selected[i]],
      item.options[item.answer],
      selected[i] === item.answer ? "Correct" :
        selected[i] === undefined ? "Unanswered" : "Incorrect"
    ];

    values.forEach((value, j) => {
      const cell = document.createElement("td");
      cell.textContent = value;

      if (j === 3) {
        cell.className = selected[i] === item.answer
          ? "text-success fw-bold"
          : "text-danger fw-bold";
      }

      row.appendChild(cell);
    });

    $("resultRows").appendChild(row);
  });
}

$("nextBtn").onclick = () => {
  if (!locked) return;

  if (index < questions.length - 1) {
    index++;
    renderQuestion();
  } else {
    finishQuiz();
  }
};

$("themeBtn").onclick = () => {
  document.body.classList.toggle("dark");
  $("themeBtn").textContent = document.body.classList.contains("dark")
    ? "☀️ Light"
    : "🌙 Dark";
};

$("restartBtn").onclick = startQuiz;

$("pdfBtn").onclick = () => {
  if (!window.jspdf) {
    alert("PDF library unavailable. Check your internet connection.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFontSize(20);
  pdf.text("QuizMaster - Quiz Results", 15, 20);
  pdf.setFontSize(12);
  pdf.text(`Score: ${score}/${questions.length}`, 15, 30);
  pdf.text(
    `Accuracy: ${Math.round(score / questions.length * 100)}%`,
    15, 38
  );

  let y = 50;

  questions.forEach((item, i) => {
    const answer = selected[i] === undefined
      ? "Not answered"
      : item.options[selected[i]];

    const lines = pdf.splitTextToSize(
      `${i + 1}. ${item.q}\nYour answer: ${answer}\n` +
      `Correct answer: ${item.options[item.answer]}\n` +
      `Status: ${selected[i] === item.answer ? "Correct" :
        selected[i] === undefined ? "Unanswered" : "Incorrect"}`,
      175
    );

    if (y + lines.length * 6 > 280) {
      pdf.addPage();
      y = 20;
    }

    pdf.text(lines, 15, y);
    y += lines.length * 6 + 7;
  });

  pdf.save("QuizMaster-Results.pdf");
};

startQuiz();
