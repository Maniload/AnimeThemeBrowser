# Roadmap

## Beta

### General
- HTTPS
- Improve REST endpoints
- Cleanup old code
- Theme Versions
    - Make automatic tag selection configurable
- Quick Search
    - Seperate themes and series
    - Make _5 more..._ clickable (redirect to full search)
- `500` default page
- Single-Page-Application
  - [require.js](http://requirejs.org) on the front-end?
- Artists

# Design
- Dark / Light theme switch: _Material_ icon (`brightness_4`)
  - Dark: [Darkly](https://bootswatch.com/darkly/)
    - Default
  - Light: [Flatly](https://bootswatch.com/flatly/)
    - `color` in `list-group-item-action` too bright

### Database
- Fully convert to _MongoDB_ / _Mongoose_
    - Browse page
    - Quick search
  
### Scraper
- Make it an all inclusive CRON-job
- Add support for TV/BD sections (e.g. Nisekoi)
    - Currently broken