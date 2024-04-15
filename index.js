import { key } from "./apikey.js"

const searchBtn = document.getElementById("search-btn")
let movieArray = []

if(searchBtn) {
    searchBtn.addEventListener("click", getMovieList)
}


async function getMovieList(e) {
    e.preventDefault()
    let searchTerm = document.getElementById("search").value
    //TODO: Remove this, here for debugging only
    if(searchTerm == "") {
        searchTerm = "Blade Runner"
    }
    searchTerm = searchTerm.replace(" ","+")

    const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&s=${searchTerm}`)
    const data = await res.json()
    console.log(data)
    movieArray = data.Search
    console.log(movieArray)
    const moviewDetailArray = await getMovieDetails(movieArray)
    console.log(moviewDetailArray)
    let divText = ""
    //TODO: Deal with a movie poster that doesn't exist
    moviewDetailArray.forEach(movie => {
        divText += `
            <div data-imdbid="${movie.imdbID}" class="movie-card">
                <img class="poster" src="${movie.Poster}">
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
                            <img class="card-action-img" src="./images/PlusIconBlack.png">Watchlist</button>
                        </button>
                    </div>
                    <div class="plot"><p class="plot">${movie.Plot}
                    </div>
                </div>
            </div>
        `
    });
    const mainContent = document.getElementById("main")
    mainContent.innerHTML = divText
    const cardDivList = document.querySelectorAll(".movie-card")
    for(let cardDiv of cardDivList){
        cardDiv.addEventListener("click", addMovieListener)
    }
}

async function getMovieDetails(movies) {
    const mDetails = []
    for (let movie of movies) {
        const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&i=${movie.imdbID}`)
        const data = await res.json()
        mDetails.push(data)
    }
    return mDetails
}

function addMovieListener(e) {
    console.log(e.target.tagName)
    if(e.target.tagName=='BUTTON'){
        addMovieToLocalStorage(e.target.dataset.imdbid)
    } else {
        console.log("Nope")
    }
}

//TODO: Check to see if it is in local storage first
function addMovieToLocalStorage(imdbId) {
    let cLocalStorage = localStorage.getItem("movieList")
    cLocalStorage = JSON.parse(cLocalStorage)
    const newItem = {
        "imdbID": imdbId
    }
    console.log(newItem)
    if(cLocalStorage) {
        cLocalStorage.push(newItem)
        localStorage.setItem("movieList", JSON.stringify(cLocalStorage))
    } else {
        localStorage.setItem("movieList", JSON.stringify([newItem]))
    }
    console.log(cLocalStorage)


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