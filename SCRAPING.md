# _MyAnimeList.net_ Page Scraping

- __URL:__ `https://myanimelist.net/anime/<ID>`
- __Example URL:__ `https://myanimelist.net/anime/4224` (=> _Toradora!_)
- __Rate Limiting:__ 1 second of delay prevents rate limitations

## Extracted Data

### High Priority

Field | Location | Notes | Usage
--- | --- | --- | ---
image | `$("meta[property='og:image']").attr("content")` | A vertical image used as cover art for the series | Used for series representation

### Medium Priority

Field | Location | Notes | Usage
--- | --- | --- | ---
members | `+$(".numbers.members strong").text().replace(",", "")` | The number of _MAL_ users that has this series on their list | Used for ordering
score | `+$("[itemprop='ratingValue']").text()` | A score between 1 and 10 for this series, based on user voting | Used for ordering

### Low Priority

Field | Location | Notes | Usage
--- | --- | --- | ---