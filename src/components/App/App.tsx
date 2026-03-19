import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Toaster, toast } from "react-hot-toast";
import ReactPaginate from "react-paginate";

import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";

import { fetchMovies, type TMDBResponse } from "../../services/movieService";
import type { Movie } from "../../types/movie";
import css from "./App.module.css";

const App = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isLoading, isError, isPlaceholderData } =
    useQuery<TMDBResponse>({
      queryKey: ["movies", searchQuery, page],
      queryFn: () => fetchMovies(searchQuery, page),
      enabled: searchQuery !== "",
      placeholderData: keepPreviousData,
    });

  useEffect(() => {
    if (data && data.results.length === 0 && !isPlaceholderData) {
      toast.error("No movies found for your request.");
    }
  }, [data, isPlaceholderData]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const movies = data?.results ?? [];
  const totalPages = data?.total_pages ?? 0;

  return (
    <div className={css.app}>
      <SearchBar onSubmit={handleSearch} />

      {isError && <ErrorMessage />}
      {isLoading && <Loader />}

      {movies.length > 0 && (
        <>
          <MovieGrid movies={movies} onSelect={setSelectedMovie} />

          {totalPages > 1 && (
            <ReactPaginate
              pageCount={totalPages}
              pageRangeDisplayed={5}
              marginPagesDisplayed={1}
              onPageChange={({ selected }) => setPage(selected + 1)}
              forcePage={page - 1}
              containerClassName={css.pagination}
              activeClassName={css.active}
              nextLabel="→"
              previousLabel="←"
            />
          )}
        </>
      )}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      <Toaster position="top-center" />
    </div>
  );
};

export default App;
