// Replace the sample copy below with your own portfolio information.
const records = [
  {
    title: "About me",
    color: "#b7c2ac",
    subtitle: "The introduction",
    lead: "Hi, I’m Noah. This is my little corner of the internet — a collection of things I make, things I learn, and ideas I’m still figuring out.",
    entries: [
      [
        "The person behind the records",
        "Use this space to introduce yourself: what you study, what you care about, and the kind of work you want to put into the world.",
        ["Your major", "Your city"]
      ],
      [
        "Outside the studio",
        "A few interests that make you, you. Add your favorite music, hobbies, creative pursuits, or whatever you could talk about for hours.",
        ["Music", "Making things", "Curiosity"]
      ]
    ]
  },
  {
    title: "Projects",
    color: "#d45f40",
    subtitle: "Selected works",
    lead: "Experiments, late nights, and ideas brought to life. A few highlights from the collection.",
    entries: [
      [
        "Project 01 — Your standout build",
        "Introduce your favorite project. What problem did it solve, what did you build, and what was the most interesting part of making it?",
        ["Technology", "Your role", "Year"]
      ],
      [
        "Project 02 — A creative experiment",
        "Show something unexpected. Explain the idea, how you approached it, and what you learned along the way.",
        ["Design", "Development"]
      ],
      [
        "Project 03 — A work in progress",
        "Share a project you’re excited about right now. Describe where it’s headed and what you’re exploring.",
        ["In progress", "Experiment"]
      ]
    ]
  },
  {
    title: "Experience",
    color: "#e6c659",
    subtitle: "The liner notes",
    lead: "The places, people, and challenges that shape how I work.",
    entries: [
      [
        "Your role · Organization",
        "Month Year — Present. Describe your responsibilities and one specific contribution you’re proud of.",
        ["Work", "Collaboration"]
      ],
      [
        "Research or leadership role",
        "Month Year — Month Year. Add research, an internship, a club, or a volunteer experience. Focus on what you contributed.",
        ["Research", "Leadership"]
      ],
      [
        "Your degree · University",
        "Expected graduation year. Highlight your field of study, relevant coursework, or academic interests.",
        ["Education"]
      ]
    ]
  },
  {
    title: "Skills",
    color: "#49748a",
    subtitle: "Tools of the trade",
    lead: "A growing toolkit for turning an idea into something real. Replace these sample categories with your strengths.",
    entries: [
      [
        "Code & build",
        "Add the languages and technologies you use most, along with how you use them.",
        ["Your language", "Your framework", "Your platform"]
      ],
      [
        "Design & explore",
        "Describe your approach to prototypes, visual design, or creative problem solving.",
        ["Prototyping", "Design tools"]
      ],
      [
        "Work with people",
        "Add a short example of how you collaborate, communicate, or lead a project.",
        ["Teamwork", "Communication"]
      ]
    ]
  },
  {
    title: "Contact",
    color: "#ddd6c3",
    subtitle: "Let’s make something",
    lead: "A good collaboration starts with a conversation. This is the place to put your contact details when you’re ready.",
    entries: [
      [
        "Email",
        "Add your preferred email address here.",
        ["Email coming soon"]
      ],
      [
        "Find me elsewhere",
        "Add your GitHub, LinkedIn, or other profiles to help people explore more of your work.",
        ["GitHub coming soon", "LinkedIn coming soon"]
      ]
    ]
  }
];

// Element lookup helper.
const $ = (id) => document.getElementById(id);

let selected = null;
let current = null;
let playing = false;
let busy = false;
let timer;

const albums = $("albums");
const legend = $("legend");
const modal = $("modal");

// Create the album sleeves and category buttons.
records.forEach((r, i) => {
  const b = document.createElement("button");

  b.className = "album a" + i;
  b.draggable = true;
  b.dataset.index = i;
  b.style.zIndex = i + 1;
  b.setAttribute("aria-label", "Select " + r.title + " record");

  b.innerHTML = `
    <span class="tiny">NOAH / VOL. 0${i + 1}</span>
    <span class="album-title">${r.title}</span>
    <span class="art"></span>
    <span class="num">
      SIDE A — ${r.subtitle.toUpperCase()}
    </span>
  `;

  b.onclick = () => select(i);

  b.ondragstart = (e) => {
    select(i);
    e.dataTransfer.setData("text/plain", String(i));
    e.dataTransfer.effectAllowed = "move";
  };

  albums.append(b);

  const l = document.createElement("button");

  l.textContent = String(i + 1).padStart(2, "0") + " " + r.title;
  l.onclick = () => select(i);

  legend.append(l);
});

// Select a record from the shelf.
function select(i) {
  if (busy) return;

  selected = i;

  [...albums.children].forEach((a, j) => {
    a.classList.toggle("selected", i === j);
    a.setAttribute("aria-pressed", String(i === j));
  });

  [...legend.children].forEach((a, j) => {
    a.classList.toggle("active", i === j);
  });

  $("hint").hidden = false;
  $("selectionText").textContent = records[i].title + " · Side A";

  $("platter").setAttribute(
    "aria-label",
    "Play " + records[i].title + " record"
  );
}

// Update the spinning record, tonearm, and playback controls.
function setPlaying(value) {
  playing = value;

  $("deck").classList.toggle("playing", value);
  $("eq").classList.toggle("playing-bars", value);
  $("playToggle").textContent = value ? "Ⅱ" : "▶";

  $("playToggle").setAttribute(
    "aria-label",
    value ? "Pause record" : "Resume record"
  );

  $("playStatus").textContent = value
    ? "Now playing · Side A"
    : "Paused · Side A";

  $("miniRecord").style.animationPlayState = value
    ? "running"
    : "paused";
}

// Animate the selected record onto the turntable.
function place() {
  if (selected === null) {
    select(0);
    return;
  }

  if (busy) return;

  busy = true;
  clearTimeout(timer);

  const i = selected;
  const from = albums.children[i].getBoundingClientRect();
  const to = $("platter").getBoundingClientRect();

  setPlaying(false);

  const fly = document.createElement("div");
  fly.className = "flying";

  fly.style.cssText = `
    left: ${from.left}px;
    top: ${from.top}px;
    width: ${from.width}px;
    height: ${from.width}px;
    --label: ${records[i].color};
  `;

  document.body.append(fly);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fly.style.left = to.left + "px";
      fly.style.top = to.top + "px";
      fly.style.width = to.width + "px";
      fly.style.height = to.height + "px";
      fly.style.transform = "rotate(120deg)";
    });
  });

  timer = setTimeout(() => {
    fly.remove();
    current = i;

    $("record").hidden = false;
    $("emptyLabel").hidden = true;
    $("record").style.setProperty("--label", records[i].color);
    $("discTitle").textContent = records[i].title;

    $("trackTitle").textContent =
      records[i].title + " — " + records[i].subtitle;

    $("openTrack").hidden = false;
    $("hint").hidden = true;

    setPlaying(true);
    busy = false;

    timer = setTimeout(openModal, 750);
  }, 680);
}

// Populate and open the current record's portfolio section.
function openModal() {
  if (current === null) return;

  const r = records[current];

  $("modalKicker").textContent =
    "Now exploring / Record 0" +
    (current + 1) +
    " / " +
    r.subtitle;

  $("miniRecord").style.setProperty("--label", r.color);

  $("modalBody").innerHTML = `
    <h2 id="modalTitle">${r.title}</h2>
    <p class="lead">${r.lead}</p>

    <div class="entries">
      ${r.entries
        .map(
          (e, i) => `
            <article class="entry">
              <span class="track-no">0${i + 1}</span>

              <div>
                <h3>${e[0]}</h3>
                <p>${e[1]}</p>

                <div class="tags">
                  ${e[2]
                    .map((t) => `<span class="tag">${t}</span>`)
                    .join("")}
                </div>
              </div>
            </article>
          `
        )
        .join("")}
    </div>

    <div class="demo-note">
      DEMO EDITION / Sample content — ready for your own story.
    </div>
  `;

  if (!modal.open) {
    modal.showModal();
  }
}

// Placement controls.
$("placeButton").onclick = place;

$("platter").onclick = () => {
  if (selected !== null && selected !== current) {
    place();
  } else if (current !== null) {
    openModal();
  } else {
    select(0);
  }
};

$("platter").onkeydown = (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    $("platter").click();
  }
};

// Drag-and-drop controls.
$("deck").ondragover = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  $("deck").classList.add("drop-hover");
};

$("deck").ondragleave = () => {
  $("deck").classList.remove("drop-hover");
};

$("deck").ondrop = (e) => {
  e.preventDefault();
  $("deck").classList.remove("drop-hover");

  const raw = e.dataTransfer.getData("text/plain");

  if (!/^[0-4]$/.test(raw)) return;

  select(Number(raw));
  place();
};

// Playback controls.
$("playToggle").onclick = () => {
  if (selected !== null && selected !== current) {
    place();
  } else if (current === null) {
    select(0);
    place();
  } else {
    setPlaying(!playing);
  }
};

$("openTrack").onclick = openModal;

// Modal controls.
$("closeModal").onclick = () => modal.close();

modal.onclick = (e) => {
  if (e.target === modal) {
    const r = modal.getBoundingClientRect();

    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    ) {
      modal.close();
    }
  }
};

$("nextTrack").onclick = () => {
  modal.close();
  select((current + 1) % records.length);
  place();
};

$("indexButton").onclick = () => {
  if (current !== null) {
    openModal();
  } else {
    select(0);
    albums.children[0].focus();
  }
};

// Footer year.
$("year").textContent = new Date().getFullYear();