const API_KEY = "3a73619bbb8fc6d47742d1b5b2b707b5";
const BASE_URL = "https://api.themoviedb.org/3";
const content = document.getElementById("content");
const searchInput = document.getElementById("searchInput");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const player = document.getElementById("player");
const sourceSelect = document.getElementById("sourceSelect");
const tvControls = document.getElementById("tvControls");
const seasonSelect = document.getElementById("seasonSelect");
const episodeSelect = document.getElementById("episodeSelect");

closeModal.onclick = () => {
  modal.classList.add("hidden");
  player.src = "";
};

async function fetchItems(query = "") {
  let url = query
    ? `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    : `${BASE_URL}/trending/all/week?api_key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  renderItems(data.results);
}

function renderItems(items) {
  content.innerHTML = "";
  items.forEach((item) => {
    const title = item.title || item.name;
    const poster = item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : "https://via.placeholder.com/150x225?text=No+Image";

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<img src="${poster}" /><h3>${title}</h3>`;
    card.onclick = () => {
      if (item.media_type === "tv") {
        showTVModal(item.id, item.name);
      } else {
        showMovieModal(item.id, title);
      }
    };
    content.appendChild(card);
  });
}

function showMovieModal(movieId, title) {
  modal.classList.remove("hidden");
  modalTitle.textContent = title;
  tvControls.style.display = "none";

  const sources = [
    `https://player.vidsrc.co/embed/movie/${movieId}?server=2`,
    `https://vidsrc.xyz/embed/movie?tmdb=${movieId}`,
    `https://player.autoembed.cc/embed/movie/${movieId}?server=1`,
    `https://vidsrc.icu/embed/movie/${movieId}`,
    `https://moviekex.online/embed/movie/${movieId}`,
    `https://vidsrc.cc/v2/embed/movie/${movieId}`,
    `https://moviesapi.club/movie/${movieId}`,
    `https://vidlink.pro/movie/${movieId}?autoplay=true&poster=true&primaryColor=00c1db`,
    `https://embed.su/embed/movie/${movieId}`,
    `https://play2.123embed.net/movie/${movieId}`,
    `https://vidora.su/movie/${movieId}?colour=dba4b2&autoplay=true&autonextepisode=true&logo=https://4texas4.github.io/ratgames/icon.png`
  ];

  sourceSelect.innerHTML = sources.map(
    url => `<option value="${url}">${new URL(url).hostname}</option>`
  ).join("");

  player.src = sources[0];

  sourceSelect.onchange = () => {
    player.src = sourceSelect.value;
  };
}

async function showTVModal(seriesId, title) {
  modal.classList.remove("hidden");
  modalTitle.textContent = title;
  tvControls.style.display = "block";

  const seasonRes = await fetch(`${BASE_URL}/tv/${seriesId}?api_key=${API_KEY}`);
  const seasonData = await seasonRes.json();

  seasonSelect.innerHTML = seasonData.seasons.map(
    s => `<option value="${s.season_number}">${s.name}</option>`
  ).join("");

  async function loadEpisodes(season) {
    const epRes = await fetch(`${BASE_URL}/tv/${seriesId}/season/${season}?api_key=${API_KEY}`);
    const epData = await epRes.json();
    episodeSelect.innerHTML = epData.episodes.map(
      e => `<option value="${e.episode_number}">${e.name}</option>`
    ).join("");

    loadTVSources(seriesId, season, epData.episodes[0].episode_number);
  }

  seasonSelect.onchange = () => {
    loadEpisodes(seasonSelect.value);
  };

  episodeSelect.onchange = () => {
    loadTVSources(seriesId, seasonSelect.value, episodeSelect.value);
  };

  await loadEpisodes(seasonSelect.value || 1);
}

function loadTVSources(seriesId, season, episode) {
  const sources = [
    `https://player.vidsrc.co/embed/tv/${seriesId}/${season}/${episode}?server=2`,
    `https://vidsrc.xyz/embed/tv?tmdb=${seriesId}&season=${season}&episode=${episode}`,
    `https://player.autoembed.cc/embed/tv/${seriesId}/${season}/${episode}`,
    `https://vidsrc.icu/embed/tv/${seriesId}/${season}/${episode}`,
    `https://moviekex.online/embed/tv/${seriesId}/${season}/${episode}`,
    `https://vidsrc.cc/v2/embed/tv/${seriesId}/${season}/${episode}`,
    `https://moviesapi.club/tv/${seriesId}-${season}-${episode}`,
    `https://vidlink.pro/tv/${seriesId}/${season}/${episode}?autoplay=false&poster=true&primaryColor=00c1db`,
    `https://embed.su/embed/tv/${seriesId}/${season}/${episode}`,
    `https://play2.123embed.net/tv/${seriesId}/${season}/${episode}`,
    `https://vidora.su/tv/${seriesId}/${season}/${episode}?colour=dba4b2&autoplay=true&autonextepisode=true&backbutton=https://ratgames.vercel.app/&pausescreen=false&logo=https://4texas4.github.io/ratgames/icon.png`
  ];

  sourceSelect.innerHTML = sources.map(
    url => `<option value="${url}">${new URL(url).hostname}</option>`
  ).join("");

  player.src = sources[0];

  sourceSelect.onchange = () => {
    player.src = sourceSelect.value;
  };
}

searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    fetchItems(searchInput.value);
  }
});

fetchItems();
