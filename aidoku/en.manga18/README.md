# Manga18 Aidoku source

Rust/WASM source for [Manga18FX](https://manga18fx.com) and its alternate domain
[MANGA18.CLUB](https://manga18.club).

The source supports search, latest/popular/genre listings, manga metadata, chapter lists,
chapter page images, deep links, and switching between the two domains from Aidoku's source
settings.

## Build

Install the WebAssembly target and Aidoku CLI, then run:

```sh
rustup target add wasm32-unknown-unknown
aidoku package
```

The generated `.aix` package can be installed in Aidoku or served from a source list.
