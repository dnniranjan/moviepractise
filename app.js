const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbpath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost/3000");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObjectmovie = (dbObjet) => {
  return {
    movieId: dbObjet["movie_id"],
    directorId: dbObjet["director_id"],
    movieName: dbObjet["movie_name"],
    leadActor: dbObjet["lead_actor"],
  };
};

const convertDbObjectToResponseObjectdirector = (dbObjet) => {
  return {
    directorId: dbObjet.director_id,
    directorName: dbObjet.director_name,
  };
};

//Get All movie names
app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `SELECT movie_name FROM movie ORDER BY movie_id;`;
  const movieArray = await db.all(getAllMoviesQuery);
  response.send(
    movieArray.map((eachItem) => {
      return convertDbObjectToResponseObjectmovie(eachItem);
    })
  );
});

//post/create a movie

app.post("/movies/", (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const postMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
    Values(${directorId},'${movieName}','${leadActor}');`;
  db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//Get a Movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM MOVIE WHERE movie_id=${movieId};`;
  const movieArray = await db.all(getMovieQuery);
  response.send(
    movieArray.map((eachItem) => {
      return convertDbObjectToResponseObjectmovie(eachItem);
    })
  );
});

//put/Update a Movie

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `UPDATE movie SET director_id=${directorId},
    movie_name='${movieName}',lead_actor='${leadActor}' WHERE movie_id=${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete a movie

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//get all directors
app.get("/director/", async (request, response) => {
  const getAllMoviesQuery = `SELECT * FROM director;`;
  const directorArray = await db.all(getAllMoviesQuery);
  //console.log(directorArray);
  response.send(
    directorArray.map((eachItem) => {
      return convertDbObjectToResponseObjectdirector(eachItem);
    })
  );
});

//get movies with sepcific director

app.get("/director/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieDirectorQuery = `SELECT movie_name FROM MOVIE WHERE director_id=${directorId};`;
  const movieDirectorArray = await db.all(getMovieDirectorQuery);
  response.send(
    movieDirectorArray.map((eachItem) => {
      return convertDbObjectToResponseObjectmovie(eachItem);
    })
  );
});

module.exports = app;
