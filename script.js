const searchInput = document.querySelector("#artist-input");
const searchBtn = document.querySelector("#search-btn");
const artistPhoto = document.querySelector("#artist-photo");
const artistNameBox = document.querySelector("#artist-name");
const albumsBox = document.querySelector("#albums");

searchBtn.addEventListener("click", searchArtist);
searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") searchArtist();
});

async function searchArtist() {
    const query = searchInput.value.trim();
    if (!query) return;

    albumsBox.innerHTML = "<p>Loading...</p>";
    artistPhoto.style.display = "none";
    artistNameBox.textContent = "";

    try {
        // 1️⃣ Search iTunes for albums
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=200`);
        const data = await res.json();
        if (!data.results.length) {
            albumsBox.innerHTML = "<p>No artist found.</p>";
            return;
        }

        // Filter exact artist match (case-insensitive)
        const filtered = data.results.filter(a => a.artistName.toLowerCase() === query.toLowerCase());

        if (!filtered.length) {
            albumsBox.innerHTML = "<p>No exact artist found.</p>";
            return;
        }

        // Remove duplicates by collectionName
        const unique = new Map();
        filtered.forEach(a => unique.set(a.collectionName, a));
        const albums = [...unique.values()];

        // Sort by release date
        albums.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));

        // Artist info
        const firstAlbum = albums[0];
        artistNameBox.textContent = firstAlbum.artistName;
        artistPhoto.src = firstAlbum.artworkUrl100.replace("100x100bb.jpg", "300x300bb.jpg");
        artistPhoto.style.display = "block";

        // Display albums
        albumsBox.innerHTML = "";
        // Inside the albums.forEach loop
        albums.forEach((album, index) => {
            const year = new Date(album.releaseDate).getFullYear();

            const card = document.createElement("div");
            card.className = "album";
            card.style.animationDelay = `${index * 0.05}s`;

            const link = document.createElement("a"); // clickable link
            link.href = album.collectionViewUrl; // iTunes URL
            link.target = "_blank"; // open in new tab

            const img = document.createElement("img");
            img.src = album.artworkUrl100.replace("100x100bb.jpg", "250x250bb.jpg");
            img.onerror = () => img.src = "https://via.placeholder.com/250?text=No+Cover";

            link.appendChild(img);
            card.appendChild(link);

            const title = document.createElement("div");
            title.className = "album-title";
            title.textContent = `${album.collectionName} (${year})`;
            card.appendChild(title);

            albumsBox.appendChild(card);
        });


    } catch (err) {
        console.error(err);
        albumsBox.innerHTML = "<p>Error fetching data.</p>";
    }
}
