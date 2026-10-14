const records = [
  {
    title: "About me",
    color: "#b7c2ac",
    subtitle: "The introduction",
    lead: "I’m Noah Getachew, a Computer Engineering student interested in building software, embedded systems, and practical tools.",
    entries: [
      [
        "Computer Engineering student",
        "I am pursuing a Bachelor of Science in Computer Engineering at Kennesaw State University, with an expected graduation date of May 2029.",
        ["Kennesaw State University", "Computer Engineering", "May 2029"]
      ],
      [
        "Recognition",
        "Recipient of the President's Volunteer Service Award (Gold) in May 2024.",
        ["Award", "May 2024"]
      ]
    ]
  },
  {
    title: "Projects",
    color: "#d45f40",
    subtitle: "Selected works",
    lead: "Software, embedded systems, and data-driven tools built through personal and startup projects.",
    entries: [
      [
        "Archive Watch",
        "Built an account-based web app that searches Mercari Japan and Yahoo Auctions for archive fashion listings. Developed keyword tracking so users can save searches and find new listings, with links to proxy services such as Buyee.",
        ["Web app", "Search", "September 2026 — Present"]
      ],
      [
        "Paradox",
        "Designed a customizable wearable accessory using a Waveshare ESP32 1.43-inch AMOLED display. Wrote and optimized C++ code for performance, display rendering, animations, and interaction design in the Arduino IDE.",
        ["C++", "ESP32", "December 2024 — Present"]
      ],
      [
        "KETSU Modules",
        "Developed custom JavaScript modules that scrape information from more than six anime and comic book websites, transform the extracted content, and integrate it into the KETSU application with asynchronous JavaScript.",
        ["JavaScript", "Web scraping", "March — December 2024"]
      ]
    ]
  },
  {
    title: "Experience",
    color: "#e6c659",
    subtitle: "The liner notes",
    lead: "Research and work experience shaped by engineering, experimentation, and dependable execution.",
    entries: [
      [
        "Research Assistant · Kennesaw State University",
        "September 2025 — January 2026. Implemented and tested a neural network-based KalmanNet algorithm, improving State of Charge estimation accuracy by approximately 20% under noisy and varying conditions. Simulated battery and electrical system models using MATLAB/Simulink and designed an embedded battery management system prototype with a microcontroller, rechargeable battery, and LCD display.",
        ["Research", "MATLAB/Simulink", "Embedded systems"]
      ],
      [
        "Team Member · Walmart",
        "February 2025 — May 2025. Delivered customer service while handling more than 90 transactions per shift, assisted with 4–6 self-checkout registers during peak hours, and helped stage more than 200 carts per shift.",
        ["Customer service", "Operations", "February — May 2025"]
      ],
      [
        "Bachelor of Science in Computer Engineering · Kennesaw State University",
        "Marietta, Georgia. Expected May 2029.",
        ["Education", "Computer Engineering", "May 2029"]
      ]
    ]
  },
  {
    title: "Skills",
    color: "#49748a",
    subtitle: "Tools of the trade",
    lead: "Languages and tools used across software, embedded systems, and engineering projects.",
    entries: [
      [
        "Code & build",
        "Programming languages used across web applications, scraping modules, embedded projects, and engineering research.",
        ["JavaScript", "Java", "C++", "Python"]
      ],
      [
        "Web & data",
        "Experience building web applications, asynchronous JavaScript modules, and scraping tools.",
        ["HTML", "SQL", "Web scraping"]
      ],
      [
        "Engineering tools",
        "Tools and platforms used for embedded development, battery modeling, and rapid prototyping.",
        ["ESP32", "Arduino IDE", "MATLAB/Simulink"]
      ]
    ]
  },
  {
    title: "Contact",
    color: "#ddd6c3",
    subtitle: "Let’s make something",
    lead: "A good collaboration starts with a conversation.",
    entries: [
      [
        "Email",
        "Reach me at noahg5120@gmail.com.",
        ["noahg5120@gmail.com"]
      ],
      [
        "Find me elsewhere",
        "",
        []
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
      NOAH / ON RECORD
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