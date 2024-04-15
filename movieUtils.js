import { key } from "./apikey.js"

let movieArray = []

//Gets the "main" movie list
//Called by the Search button on the Search Page
export async function getMovieList() {
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
    return movieArray
}

//Gets movie details from the API for all of the movies
//This operates on both the search results and the
//items stored in local storage. 
export async function getMovieDetails(movies) {
    if(movies) {

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
    } else {
        return []
    }
}

export function getMovieFromList(imdbNumber) {

    console.log("imdbNumber: "+ imdbNumber)
    const foundItem = movieArray.find((movie) => {
        if(movie) {
            if(movie.imdbID === imdbNumber) {
                console.log("Found Movie: "+JSON.stringify(movie))
                return movie
            }
        }
    })
    return foundItem
}