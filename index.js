import { 
    getMovieList, 
    getMovieDetails, 
    getMovieFromList 
} from "./movieUtils.js"

//Provides context to some functions as to
//whether or not we are on the search page
//or the watch list
const page = document.body.dataset.pageid

//If we're on the watch list, do default things for that
//page
if(page==="watchlist") {
    setupWatchlist()
//otherwise, right now, we're on the search page
} else {
    //Search Button Element on the search page
    const searchBtn = document.getElementById("search-btn")
    searchBtn.addEventListener("click", handleSearchClick)
}

//Handles clicking the search button
async function handleSearchClick(e) {
    e.preventDefault()
    const basicMovieList = await getMovieList()
    renderMovieCards(basicMovieList, page)
}

//Sets up the main portion of the watchlist
async function setupWatchlist() {
    const watchList = localStorage.getItem("movieList")
    //If there are items in the local watchlist, display them
    if(watchList) {
        //The local watch list is only as deep as the search result
        //so we need to get the details before displaying them.
        const movieDetailArray = await getMovieDetails(JSON.parse(watchList))
        renderMovieCards(movieDetailArray, page)
    } else {
        renderEmptyState(page)
    }
}

//renders the main portion of the page, either the watchlist
//or the search results
async function renderMovieCards(basicMovieArray, context) {
    if (basicMovieArray.length == 0) {
        //bail, there were no search results
        renderEmptyState(context);
        return;
    } else {
        const detailMovieArray = await getMovieDetails(basicMovieArray);
        //Depending on whether we are rendering the search page
        //or the watch list, the button HTML is different. This
        //accounts for that
        const buttonHTML = getCorrectCardButton(context);
        console.log("buttonHTML", buttonHTML);
        let cardsHTML = "";
        detailMovieArray.forEach((movie) => {
            cardsHTML += renderIndividualCard(movie, buttonHTML);
        });
        //get the main portion of the page
        const mainContent = document.getElementById("main");
        mainContent.innerHTML = cardsHTML;
        //Add event listeners to the cards
        const cardDivList = document.querySelectorAll(".movie-card");
        for (let cardDiv of cardDivList) {
            cardDiv.addEventListener("click", movieListener);
        }
    }
}

//Depending on the watchlist or search page each card has
//a different button. I could probably do some styling tricks,
//but this seems more obvious
function getCorrectCardButton(context) {
    console.log('context', context)
    let html = ""
    if(context==="searchpage") {
        html = `
        <img class="card-action-img" src="./images/PlusIconBlack.png">Watchlist</button>
        `
    } else {
        html = `
        <img class="card-action-img" src="./images/MinusIconBlack.png">Remove</button>
    `
    }
    return html
}

//Renders a single card for a movie with the correct button
function renderIndividualCard(movie, buttonHTML) {
    console.log('movie', movie)
    const posterHTML = getPoster(movie)
    console.log('posterHTML', posterHTML)
    const html = `
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
                <div class="plot">
                    <p>${movie.Plot}
                </div>
            </div>
        </div>
    `
    return html
}

//There are some cases where the poster is blank.
//When that happens the API returns N/A
function getPoster(movie) {
    let html = ""
    //Check for poset = N/A and display a placeholder image in 
    //cases where there isn't an image (otherwise we get an
    //error in the console)
    if(movie.Poster!="N/A") {
        html = `
        <img class="poster" src="${movie.Poster}">
        `
    } else {
        html = `
        <img class="poster" src="https://placehold.co/100x150">
        `
    }
    return html
}

//Handles the watchlist being empty as well as no search results
function renderEmptyState(context) {
    let emptyHTML = ""
    if(context === "watchlist") {
        emptyHTML = `
            <div class="empty-state">
                <p>Your watchlist is looking a little empty...</p>
                <button id="add-movies" class="add-movies-btn"><img class="card-action-img" src="./images/PlusIconBlack.png">Let's Add some movies</button>
            </div>
        `
    } else {
        emptyHTML = `
            <div class="empty-state">
                <p>Unable to find what you're looking for. Please try another search</p>
            </div>
        `
    }
    const mainContent = document.getElementById("main")
    mainContent.innerHTML = emptyHTML
    const addMoviesButton = document.getElementById("add-movies")
    if(addMoviesButton) {
        addMoviesButton.addEventListener("click", (e) => {
            e.preventDefault()
            window.location = "/index.html"
        } )
    }
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
    const newItem = getMovieFromList(imdbId)
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