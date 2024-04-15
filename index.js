import { key } from "./apikey.js"

//Provides context to some functions as to
//whether or not we are on the search page
//or the watch list
const page = document.body.dataset.pageid

//Search Button Element
const searchBtn = document.getElementById("search-btn")

let movieArray = []

//If we're on the watch list, do default things
if(page==="watchlist") {
    setupWatchlist()
}

if(searchBtn) {
    searchBtn.addEventListener("click", getMovieList)
}

async function setupWatchlist() {
    const watchList = localStorage.getItem("movieList")
    //If there are items in the local watchlist, display them
    if(watchList) {
        //The local watch list is only as deep as the search result
        //so we need to get the details before displaying them.
        const movieDetailArray = await getMovieDetails(JSON.parse(watchList))
        renderMovieCards(movieDetailArray, page)
    }
}

//Called by the Search button on the Search Page
async function getMovieList(e) {
    e.preventDefault()
    //Get the search term
    let searchTerm = document.getElementById("search").value
    
    //TODO: Remove this, here for debugging only
    if(searchTerm == "") {
        searchTerm = "Blade Runner"
    }
    //Replace spaces for the query param
    searchTerm = searchTerm.replace(" ","+")

    //Call the API and wait for data
    const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&s=${searchTerm}`)
    const data = await res.json()
    //Set the movie array to the resulst of the search
    movieArray = data.Search
    //Get the details of each movie
    //The basic search doesn't include the plot, which was required
    //by the design
    const moviewDetailArray = await getMovieDetails(movieArray)
    //Display the cards
    renderMovieCards(moviewDetailArray, page)
}

//Gets movie details from the API for all of the movies
//This operates on both the search results and the
//items stored in local storage. 
async function getMovieDetails(movies) {
    //Empty array to store details in
    const mDetails = []
    //Lookup each movie based on it's IMDB number
    for (let movie of movies) {
        if(movie) {
            const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&i=${movie.imdbID}`)
            const data = await res.json()
            mDetails.push(data)
        }
    }
    return mDetails
}

function renderMovieCards(detailMovieArray, context) {
    console.log('renderMovieCards', detailMovieArray)
    if(detailMovieArray.length===0) {
        renderEmptyState(context)
    } else {

        //Depending on whether we are rendering the search page
        //or the watch list, the button HTML is different. This
        //accounts for that
        let buttonHTML = ""
        if(context==="searchpage") {
            buttonHTML = `
            <img class="card-action-img" src="./images/PlusIconBlack.png">Watchlist</button>
            `
        } else {
            buttonHTML = `
            <img class="card-action-img" src="./images/MinusIconBlack.png">Remove</button>
        `
    }
    //Variable that holds the entire text of the cards portion
    let cardsHTML = ""
    detailMovieArray.forEach(movie => {
        console.log(movie)
        //There are some cases where the poster is blank.
        //When that happens the API returns N/A
        //Check for that and display a placeholder image in 
        //cases where there isn't an image (otherwise we get an
        //error in the console)
        let posterHTML = ""
        if(movie.Poster!="N/A") {
            posterHTML = `
            <img class="poster" src="${movie.Poster}">
            `
        } else {
            posterHTML = `
            <img class="poster" src="https://placehold.co/100x150">
            `
        }
        //Create the HTML for a specific card
        cardsHTML += `
        <div data-imdbid="${movie.imdbID}" class="movie-card">
        ${posterHTML}
        <div class="movie-details">
        <div class="movie-lead">
        <p class="movie-title">${movie.Title}</p>
        <img class="star" src="./images/star.png">
        <p class="rating">${movie.imdbRating}
        </div>
        <div class="metadata">
        <p class="runtime">${movie.Runtime}</p>
        <p class="genre">${movie.Genre}</p>
        <button class="card-action-btn" data-imdbid="${movie.imdbID}">
        ${buttonHTML}
        </button>
        </div>
        <div class="plot"><p class="plot">${movie.Plot}
        </div>
        </div>
        </div>
        `
    });
    //On both the search and list pages we replace the contents
    //the main div with the HTML generated here.
    //TODO: deal with empty states (no search results and no
    //Items in the watchlist)
    const mainContent = document.getElementById("main")
    mainContent.innerHTML = cardsHTML
    //Add event listeners to the cards
    const cardDivList = document.querySelectorAll(".movie-card")
    for(let cardDiv of cardDivList){
        cardDiv.addEventListener("click", movieListener)
    }
    }
}

function renderEmptyState(context) {
    let emptyHTML = ""
    if(context === "watchlist") {
        emptyHTML = `
            <div class="empty-state">
                <p>Your watchlist is looking a little empty...</p>
                <button class="add-movies-btn"><img class="card-action-img" src="./images/PlusIconBlack.png">Let's Add some movies</button>
            </div>
        `
    } else {

    }
    const mainContent = document.getElementById("main")
    mainContent.innerHTML = emptyHTML
}


//Event listener for Add and Remove buttons
function movieListener(e) {
    //Remove on the watch list
    if(page==="watchlist") {
        if(e.target.tagName=='BUTTON'){
            removeMovieFromLocalStorage(e.target.dataset.imdbid)
        }
    //Add on the search page
    } else {
        if(e.target.tagName=='BUTTON'){
            addMovieToLocalStorage(e.target.dataset.imdbid)
        }
    }
}

async function removeMovieFromLocalStorage(imdbId) {
    //Get the movies from local storage
    const cLocalStorage = JSON.parse(localStorage.getItem("movieList"))
    //Get the index of the clicked movie
    let itemIndex = -1
    for (let ii=0; ii<cLocalStorage.length; ii++) {
        if(cLocalStorage[ii]) {
            if(cLocalStorage[ii].imdbID === imdbId) {
                itemIndex = ii
            }
        }
    }
    //If we found the movie, remove it
    if(itemIndex>=0) {
        cLocalStorage.splice(itemIndex,1)
    }
    //Rewrite local storage
    localStorage.setItem("movieList", JSON.stringify(cLocalStorage))
    //Render the cards
    const movieDetailArray = await getMovieDetails(cLocalStorage)
    renderMovieCards(movieDetailArray, page)
}


function addMovieToLocalStorage(imdbId) {
    //Get local storage
    const cLocalStorage = JSON.parse(localStorage.getItem("movieList"))
    const newItem = getMovieFromList(movieArray, imdbId)
    if(cLocalStorage) {
        const movieExists = cLocalStorage.some((movie) => movie.imdbID === imdbId)
        if(!movieExists) {
            cLocalStorage.push(newItem)
            localStorage.setItem("movieList", JSON.stringify(cLocalStorage))
        } else {
            console.log("Movie exists")
        }
    } else {
        localStorage.setItem("movieList", JSON.stringify([newItem]))
    }
}

function getMovieFromList(array, imdbNumber) {

    console.log("imdbNumber: "+ imdbNumber)
    const foundItem = array.find((movie) => {
        if(movie) {
            if(movie.imdbID === imdbNumber) {
                console.log("Found Movie: "+JSON.stringify(movie))
                return movie
            }
        }
    })
    return foundItem
}






/*
{
    "Search": [
        {
            "Title": "Blade Runner",
            "Year": "1982",
            "imdbID": "tt0083658",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BNzQzMzJhZTEtOWM4NS00MTdhLTg0YjgtMjM4MDRkZjUwZDBlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg"
        },
        {
            "Title": "Blade Runner 2049",
            "Year": "2017",
            "imdbID": "tt1856101",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_SX300.jpg"
        },
        {
            "Title": "Blade Runner: Black Out 2022",
            "Year": "2017",
            "imdbID": "tt7428594",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BZGNiNmNiMTctMDI4OS00OWYxLWE4ZWEtZjFkZjU4ZmY5YzEyXkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_SX300.jpg"
        },
        {
            "Title": "Blade Runner: Black Lotus",
            "Year": "2021–2022",
            "imdbID": "tt9359796",
            "Type": "series",
            "Poster": "https://m.media-amazon.com/images/M/MV5BYjVlOThlOWItNTNjOC00OTAyLWEyOTctOGE1NTgyYTJiMjljXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg"
        },
        {
            "Title": "Dangerous Days: Making Blade Runner",
            "Year": "2007",
            "imdbID": "tt1080585",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BNzI2NjU0MjY4MF5BMl5BanBnXkFtZTgwMjM0NDQzNjE@._V1_SX300.jpg"
        },
        {
            "Title": "Blade Runner",
            "Year": "1997",
            "imdbID": "tt0126817",
            "Type": "game",
            "Poster": "https://m.media-amazon.com/images/M/MV5BYWRkYjczZWMtN2Q5NS00YWFmLTk3M2MtNWUwNWRjYzdkMjZhXkEyXkFqcGdeQXVyNjExODE1MDc@._V1_SX300.jpg"
        },
        {
            "Title": "Oscar Pistorius: Blade Runner Killer",
            "Year": "2017",
            "imdbID": "tt7445510",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BZTYxZjU5YTgtN2NmOC00NmQ0LTk4MmEtYjc0YmI5MTI0ZDFhXkEyXkFqcGdeQXVyNTMzNDY2NzU@._V1_SX300.jpg"
        },
        {
            "Title": "On the Edge of 'Blade Runner'",
            "Year": "2000",
            "imdbID": "tt0281011",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BMGRhY2RlMWYtOGQ4Yi00NmMxLWJiZDUtZmRkZjYzYWRlNmExXkEyXkFqcGdeQXVyMTQxNzE3ODA3._V1_SX300.jpg"
        },
        {
            "Title": "Phenomenon Blade Runner",
            "Year": "2021",
            "imdbID": "tt14730032",
            "Type": "movie",
            "Poster": "https://m.media-amazon.com/images/M/MV5BMTJkNmU2MzgtYTExMy00OGQ3LTllOGItMjFhMzQyN2FkNmU3XkEyXkFqcGdeQXVyNTM2NTg3Nzg@._V1_SX300.jpg"
        },
        {
            "Title": "Blade Runner: Deleted and Alternate Scenes",
            "Year": "2007",
            "imdbID": "tt1165254",
            "Type": "movie",
            "Poster": "N/A"
        }
    ],
    "totalResults": "35",
    "Response": "True"
}
*/