import { config } from './config.js';

const API_KEY = config.API_KEY;
const watchlistContainer = document.getElementById("my-watchlist-results");

async function fetchMovieDetails(id) {
    /* 
    This function is responsible for calling the movie API and then returning
    the response as an array, after promise chains are fulfilled.
    */

    try {
        const response = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}&plot=full`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("Error fetching movie details:", error);
        return null;
    }
}

function createMovieElement(movie) {
    /* 
    This function handles creating the HTML for each object within the
    local storage in a suitable format similar to the search results in index.js.
    The parameter is one individual movie gathered from a loop of the local storage array.
    Returns a complete HTML object.
    */
    const movieElement = document.createElement('div');
    movieElement.classList.add("individual-movie-wrapper");
    movieElement.innerHTML = `
        <div class="movie-information-container">
            <div class="movie-poster-div">
                <img class="movie-poster" src="${movie.Poster}" alt="${movie.Title} poster">
            </div>
            <div class="movie-info-div">
                <div class="title-icon-rating inter">
                    <h3>${movie.Title}</h3> 
                    <i class="fa-solid fa-star"></i> 
                    <p class="inter">${movie.imdbRating}</p>
                </div>
                <div class="runtime-genre-watchlist inter">
                    <p>${movie.Runtime}</p>
                    <p>${movie.Genre}</p>
                    <div class="watchlist-button-div">
                        <i data-imdbid="${movie.imdbID}" class="fa-solid fa-minus watchlist-icon"></i>
                        <button id="watchlist-btn">Remove</button>
                    </div>
                </div>
                <div class="movie-plot-div">
                    <p class="movie-plot inter">${movie.Plot}</p>
                </div>
            </div>
        </div>
        <hr class="seperator">
    `;
    return movieElement;
}

async function renderWatchlist() {
    /* 
    Function that loops through the array gathered from local storage at the beginning
    of the function, which then retrieves individual movie data via calling the 
    FetchMovieDetails function to trigger an API call. Using the gathered data,
    a HTML object is created using the CreateMovieElement function, which is lastly
    appended to the watchlist container.
    */
    const savedMovies = JSON.parse(localStorage.getItem('savedMovies')) || [];
    
    if (savedMovies.length === 0) {
        watchlistContainer.innerHTML = '<p class="empty-watchlist">Your watchlist is empty</p>';
        return;
    }

    watchlistContainer.innerHTML = ''; // Clear existing content

    for (const movieId of savedMovies) {
        const movieDetails = await fetchMovieDetails(movieId);
        if (movieDetails) {
            const movieElement = createMovieElement(movieDetails);
            watchlistContainer.appendChild(movieElement);
        }
    }
}

function removeFromWatchlist(imdbID) {
    /* 
    Function retrieves local storage array and removes the object in the array
    that has the exact imdbID as the input, then updates the localstorage and the
    watchlist container.
    */
    let savedMovies = JSON.parse(localStorage.getItem('savedMovies')) || [];
    savedMovies = savedMovies.filter(id => id !== imdbID);
    localStorage.setItem('savedMovies', JSON.stringify(savedMovies));
    renderWatchlist();
}


document.addEventListener('click', function(e) {
    /* 
    Event listener that checks for if the event clicked has a minus icon or
    the id is equal to that of the button. Then targets the closest individual
    movie object and removes it from the local storage.
    */
    if (e.target.classList.contains('fa-minus') || e.target.id === 'watchlist-btn') {
        const movieElement = e.target.closest('.individual-movie-wrapper');
        const imdbID = movieElement.querySelector('.watchlist-icon').dataset.imdbid;
        removeFromWatchlist(imdbID);
    }
});


renderWatchlist();