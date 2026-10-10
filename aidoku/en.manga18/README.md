# Manga18 Club Aidoku source

Rust/WASM source for [Manga18 Club](https://manga18.club).

The source supports search, latest/popular/genre listings, manga metadata, chapter lists,
chapter page images, and deep links.

## Build

Install the WebAssembly target and Aidoku CLI, then run:

```sh
rustup target add wasm32-unknown-unknown
aidoku package
```

The generated `.aix` package can be installed in Aidoku or served from a source list.
