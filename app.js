const express = require("express");

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = (__dirname, "moviesData.db");

let db = null;

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`dataBase error: ${e.message}`);
    process.exit(1);
  }
};

initializeDb();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

// API 1 getting all movies names
app.get("/movies/", async (request, response) => {
  const movies = `SELECT movie_name FROM  movie`;

  const moviesList = await db.all(movies);

  response.send(
    moviesList.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

// API 2 Create New Movie
app.post("/movies/", async (request, response) => {
  const newMovie = request.body;

  const { directorId, movieName, leadActor } = newMovie;

  const newMovieDetails = `INSERT INTO  movie (director_id, movie_name, lead_actor)

                             VALUES ('${directorId}',
                                      '${movieName}',
                                      '${leadActor}')`;

  const addingNewMovie = await db.run(newMovieDetails);
  response.send("Movie Successfully Added");
});

// API 3  Getting Particular Movie

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const particularMovie = `select * from movie where movie_id = ${movieId};`;

  const movieDetails = await db.get(particularMovie);
  //console.log(movieDetails);
  response.send(convertDbObjectToResponseObject(movieDetails));
});

// API 4 Updating movie Details
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const movieDetailsUpdate = `

        UPDATE movie  SET 
                           director_id = '${directorId}',
                           movie_name =  '${movieName}',
                            lead_actor = '${leadActor}' 
                      WHERE movie_id = ${movieId}`;

  await db.run(movieDetailsUpdate);
  response.send("Movie Details Updated");
});

//API 5 Removing Movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovie = `DELETE FROM movie WHERE  movie_id = ${movieId}`;

  await db.run(deleteMovie);
  response.send("Movie Removed");
});

// API 6 Director Details
app.get("/directors/", async (request, response) => {
  const directorDetails = `SELECT * FROM  director`;

  const directorDetailsArray = await db.all(directorDetails);

  response.send(
    directorDetailsArray.map((eachDirector) =>
      convertDbObjectToResponseObject(eachDirector)
    )
  );
});

// all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const SpecificDirectorMovies = `SELECT movie_name FROM movie  WHERE  director_id = ${directorId}`;

  const moviesList = await db.all(SpecificDirectorMovies);

  response.send(
    moviesList.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

module.exports = app;
