import { config } from './config.js';

const API_KEY = config.API_KEY;
const resultsContainer = document.getElementById("results-container")
const searchInput = document.getElementById("search-input-id")
const searchButton = document.getElementById("search-button")
const watchlistButton = document.getElementById("watchlist-button")


resultsContainer.innerHTML = `<div class="no-results-div inter">
                                                <i class="fa-solid fa-film"></i> 
                                                <h1>Start Exploring</h1>
                                             </div>`



async function handleSearch() {
   const searchTerm = searchInput.value.trim();
   if (searchTerm === '') {
       console.log("Nothing has been searched");
   } else {
       try {
           const searchResults = await apiCall(searchTerm);
           console.log(searchResults);
           
           if (searchResults.Response === 'True') {
               resultsContainer.innerHTML = '';

               const totalMovies = searchResults.Search.length;
               const moviePromises = searchResults.Search.map(async (movie, index) => {
                   try {
                       const movieDetails = await fetchMovieDetails(movie.imdbID);
                       return {
                           movieDetails,
                           isLastMovie: index === totalMovies - 1
                       };
                   } catch (err) {
                       console.error("Error fetching movie details:", err);
                       return null;
                   }
               });

               const movies = await Promise.all(moviePromises);

               movies.forEach(({ movieDetails, isLastMovie }) => {
                   if (movieDetails) {
                       displayResults(movieDetails, resultsContainer, isLastMovie);
                   }
               });
           } else {
               console.log(searchResults);
               resultsContainer.innerHTML = '';
               const emptyElement = document.createElement('div');
               emptyElement.classList.add('no-response-div', 'inter');
               emptyElement.innerHTML = '<h3>Unable to find what you\'re looking for.</h3>';
               resultsContainer.appendChild(emptyElement);
           }
       } catch (err) {
           console.error("Error in API call:", err);
       }
   }

   searchInput.value = ''


};


searchButton.addEventListener('click', handleSearch)

searchInput.addEventListener('keydown', function(e) {
   if (e.key === 'Enter') {
       handleSearch();
   }
});


async function apiCall(searchterm) {
   const res = await fetch(`https://www.omdbapi.com/?s=${searchterm}&apikey=${API_KEY}`)
   const data = await res.json()
   const result = data
   return result
}

async function fetchMovieDetails(id) {
   const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}&plot=full`)
   const data = await res.json()
   const result = data
   return result
}

function displayResults(results, container, isLastMovie) {
   if (results && results.Poster) {
       const movieElement = document.createElement('div');
       const isSaved = savedMovies.includes(results.imdbID);
       movieElement.innerHTML = `
           <div class="movie-information-container">
               <div class="movie-poster-div">
                   <img class="movie-poster" src="${results.Poster}" alt="${results.Title} poster">
               </div>
               <div class="movie-info-div">
                   <div class="title-icon-rating inter">
                       <h3>${results.Title}</h3> 
                       <i class="fa-solid fa-star"></i> 
                       <p class="inter">${results.imdbRating}</p>
                   </div>
                   <div class="runtime-genre-watchlist inter">
                       <p>${results.Runtime}</p>
                       <p>${results.Genre}</p>
                       <div class="watchlist-button-div">
                           <i data-imdbid="${results.imdbID}" class="fa-solid ${isSaved ? 'fa-minus' : 'fa-plus'} watchlist-icon"></i>
                           <button id="watchlist-btn">${isSaved ? 'Remove' : 'Watchlist'}</button>
                       </div>
                   </div>
                   <div class="movie-plot-div">
                       <p class="movie-plot inter">${results.Plot}</p>
                   </div>
                   <div class="buttons-container">
                       <button class="read-more-btn">Read More</button>
                       <button class="read-less-btn">Read Less</button>
                   </div>
               </div>
           </div>
       `;

       
       if (!isLastMovie) {
           const separator = document.createElement('hr');
           separator.classList.add('separator');
           movieElement.appendChild(separator);
       }

       movieElement.classList.add("individual-movie-wrapper");
       container.appendChild(movieElement);

       
       const moviePlotDiv = movieElement.querySelector('.movie-plot-div');
       const readMoreBtn = movieElement.querySelector('.read-more-btn');
       const readLessBtn = movieElement.querySelector('.read-less-btn');
       const buttonsContainer = movieElement.querySelector('.buttons-container');

       function checkOverflow() {
           const isOverflowing = moviePlotDiv.scrollHeight > moviePlotDiv.clientHeight;
           buttonsContainer.style.display = isOverflowing ? 'block' : 'none';
       }

       checkOverflow();

       readMoreBtn.addEventListener('click', function() {
           moviePlotDiv.classList.add('expanded');
           readMoreBtn.style.display = 'none';
           readLessBtn.style.display = 'block';
       });

       readLessBtn.addEventListener('click', function() {
           moviePlotDiv.classList.remove('expanded');
           readMoreBtn.style.display = 'block';
           readLessBtn.style.display = 'none';
       });
   } 
}



function initializeLocalStorage() {
      if (!localStorage.getItem("savedMovies")) {
         localStorage.setItem("savedMovies", JSON.stringify([]));
      }
   }

function cleanLocalStorageData() {
   let savedMovies = JSON.parse(localStorage.getItem("savedMovies")) || [];
   savedMovies = savedMovies.filter(item => item !== null);
   localStorage.setItem("savedMovies", JSON.stringify(savedMovies));
   
}

initializeLocalStorage();
cleanLocalStorageData();


let savedMovies = JSON.parse(localStorage.getItem("savedMovies")) || [];

function handleMovieClick(imdbID, element) {
   if (imdbID) {
      
      let savedMovies = JSON.parse(localStorage.getItem("savedMovies")) || [];
      
      if (!savedMovies.includes(imdbID)) {
         
         savedMovies.push(imdbID);
         element.querySelector('.fa-plus').classList.replace('fa-plus', 'fa-minus');
         element.querySelector('#watchlist-btn').textContent = 'Remove';

      } else {
         
         savedMovies = savedMovies.filter(function(id) {
            
            return id !== imdbID;
         });

         element.querySelector('.fa-minus').classList.replace('fa-minus', 'fa-plus');
         element.querySelector('#watchlist-btn').textContent = 'Watchlist';
      }
      
      
      localStorage.setItem("savedMovies", JSON.stringify(savedMovies));
   }
}


document.addEventListener('click', function(e) {
   const imdbIDSaved = e.target.dataset.imdbid
   
   if(imdbIDSaved) {
      const watchlistDiv = e.target.closest('.watchlist-button-div');
      handleMovieClick(imdbIDSaved, watchlistDiv)
   }
})


export { initializeLocalStorage, fetchMovieDetails, displayResults };
