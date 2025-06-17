// script.js

const apiKey = "3a73619bbb8fc6d47742d1b5b2b707b5";
const apiBase = "https://api.themoviedb.org/3";
const imageBase = "https://image.tmdb.org/t/p/w500";
const mainContainer = document.getElementById("main");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalIframe = document.getElementById("modalIframe");
const modalSources = document.getElementById("sourceSelect");
const seasonSelect = document.getElementById("seasonSelect");
const episodeSelect = document.getElementById("episodeSelect");
const searchInput = document.getElementById("searchInput");
const closeModalBtn = document.getElementById("closeModal");

let currentPage = 1;
let isFetching = false;

async function fetchPopular() {
  if (isFetching) return;
  isFetching = true;
  const res = await fetch(`${apiBase}/trending/all/week?api_key=${apiKey}&page=${currentPage}`);
  const data = await res.json();
  data.results.forEach(show => createCard(show));
  isFetching = false;
}

function createCard(item) {
  const div = document.createElement("div");
  div.classList.add("card");
  const title = item.title || item.name;
  const poster = item.poster_path ? `${imageBase}${item.poster_path}` : "";
  div.innerHTML = `
    <img src="${poster}" alt="${title}">
    <h4>${title}</h4>
  `;
  div.onclick = () => {
    if (item.media_type === "tv") {
      showTVModal(item.id, title);
    } else {
      showMovieModal(item.id, title);
    }
  };
  mainContainer.appendChild(div);
}

function showMovieModal(movieId, title) {
  modalTitle.textContent = title;
  seasonSelect.style.display = "none";
  episodeSelect.style.display = "none";
  const sources = [
    `https://vidsrc.xyz/embed/movie?tmdb=${movieId}`,
    `https://player.vidsrc.co/embed/movie/${movieId}?server=2`,
    `https://player.autoembed.cc/embed/movie/${movieId}?server=1`,
    `https://vidsrc.icu/embed/movie/${movieId}`,
    `https://moviekex.online/embed/movie/${movieId}`,
    `https://vidsrc.cc/v2/embed/movie/${movieId}`,
    `https://moviesapi.club/movie/${movieId}`,
    `https://vidlink.pro/movie/${movieId}?autoplay=true&poster=true&primaryColor=00c1db`,
    `https://embed.su/embed/movie/${movieId}`,
    `https://vidora.su/movie/${movieId}?colour=dba4b2&autoplay=true&autonextepisode=true&logo=https://4texas4.github.io/ratgames/icon.png`
  ];
  loadSources(sources);
}

async function showTVModal(seriesId, title) {
  modalTitle.textContent = title;
  seasonSelect.style.display = "inline-block";
  episodeSelect.style.display = "inline-block";
  const res = await fetch(`${apiBase}/tv/${seriesId}?api_key=${apiKey}`);
  const data = await res.json();
  seasonSelect.innerHTML = "";
  data.seasons.forEach(season => {
    const opt = document.createElement("option");
    opt.value = season.season_number;
    opt.textContent = season.name;
    seasonSelect.appendChild(opt);
  });
  seasonSelect.onchange = () => loadEpisodes(seriesId);
  episodeSelect.onchange = () => loadTVSources(seriesId);
  loadEpisodes(seriesId);
}

async function loadEpisodes(seriesId) {
  const season = seasonSelect.value;
  const res = await fetch(`${apiBase}/tv/${seriesId}/season/${season}?api_key=${apiKey}`);
  const data = await res.json();
  episodeSelect.innerHTML = "";
  data.episodes.forEach(ep => {
    const opt = document.createElement("option");
    opt.value = ep.episode_number;
    opt.textContent = ep.name;
    episodeSelect.appendChild(opt);
  });
  loadTVSources(seriesId);
}

function loadTVSources(seriesId) {
  const season = seasonSelect.value;
  const episode = episodeSelect.value;
  const sources = [
    `https://vidsrc.xyz/embed/tv?tmdb=${seriesId}&season=${season}&episode=${episode}`,
    `https://player.vidsrc.co/embed/tv/${seriesId}/${season}/${episode}?server=2`,
    `https://player.autoembed.cc/embed/tv/${seriesId}/${season}/${episode}`,
    `https://vidsrc.icu/embed/tv/${seriesId}/${season}/${episode}`,
    `https://moviekex.online/embed/tv/${seriesId}/${season}/${episode}`,
    `https://vidsrc.cc/v2/embed/tv/${seriesId}/${season}/${episode}`,
    `https://moviesapi.club/tv/${seriesId}-${season}-${episode}`,
    `https://vidlink.pro/tv/${seriesId}/${season}/${episode}?autoplay=false&poster=true&primaryColor=00c1db`,
    `https://embed.su/embed/tv/${seriesId}/${season}/${episode}`,
    `https://vidora.su/tv/${seriesId}/${season}/${episode}?colour=dba4b2&autoplay=true&autonextepisode=true&backbutton=https://ratgames.vercel.app/&pausescreen=false&logo=https://4texas4.github.io/ratgames/icon.png`
  ];
  loadSources(sources);
}

function loadSources(sources) {
  modalSources.innerHTML = "";
  sources.forEach(src => {
    const opt = document.createElement("option");
    opt.value = src;
    opt.textContent = new URL(src).hostname;
    modalSources.appendChild(opt);
  });
  modalSources.onchange = () => {
    modalIframe.src = modalSources.value;
  };
  modalIframe.src = sources[0];
  modal.style.display = "flex";
}

closeModalBtn.onclick = () => {
  modal.style.display = "none";
  modalIframe.src = "";
};

searchInput.addEventListener("keydown", async e => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (!query) return;
    mainContainer.innerHTML = "";
    const res = await fetch(`${apiBase}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    data.results.forEach(createCard);
  }
});

// Infinite scroll
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    currentPage++;
    fetchPopular();
  }
});

// Initial load
fetchPopular();
