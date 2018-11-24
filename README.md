# Anime Theme Browser

## Database Structure

Current database architecture: __MongoDB__

Conventions:
- All entity names are written in singular for consistency and simplicity reasons
- All names are written in camel case
- Enum values are written as integers for portability reasons

## Collections

### <a name="collection.series"></a>Series

An independent anime series entry. Sometimes multiple seasons are referred to as one series and sometimes every season is 
considered as an own series entry. This depends on the series' definition (see _MyAnimeList_).

Movies are also considered as series. In a sequence of movies every movie has it's own entry.

Series entries are defined by their explicit title, a cover image and the season in which the series was airing. 
The season is splitted into the atomic parts quarter and year: 
- If no quarter is declared threre is no specific cour in which the series started airing (often with older series)
- If the year is less then `100` it refers to a decade (e.g. a year value of `90` refers to a series that ran in the 
_90s_)).

Anime entries can have multiple aliases which can also be used to query (e.g. English variants of the title, see 
the [Alias](#type.alias) type).

Anime entries can have multiple themes which are defined by the [Theme](#collection.theme) collection.

#### Examples

These are valid anime entries:
- _Charlotte_ (series, only one season exists)
- _Shokugeki no Souma_ (series, first season is meant)
- _Kimi no Na wa._ (movie)

These are __non__-valid anime entries:
- _Shingeki no Kyojin_ (series, all seasons are meant)
    > All seasons should be declared independently.
- _Detective Conan: The Movies_ (multiple movies are meant)
    > All movies should be declared independently.

#### Structure

Collection Name: `series`

##### Fields

Field | Type | Required | Notes
--- | --- | :---: | ---
_id | Number | ✓ | An unique numerical identifier for this series. Equal to the id found on _MyAnimeList.net_.
title | String | ✓ | The explicit (maybe Japanese, but written in Latin anyway) title for this series.
image | String | ✓ | A (vertical) cover for this series. Currently hosted by the _MyAnimeList.net_ CDN.
season | Object | ✓ | The season in which this series was airing.
season.year | Number | ✓ | The year (or decade) in which this series was airing.
season.quarter | Number | - | The quarter of the year in which this series was airing.
aliases | Array of [Alias](#type.alias) | - | An array of aliases for this series. See the [Alias](#type.alias) type.

---

### <a name="table.theme"></a>Theme

A theme of a series entry. A theme is (most of the time) an excerpt of a song backed up by an animated video. 

Themes are defined by an explicit artist and song title (written in Latin), an index and a type. A theme's type 
(e.g. `OPENING`) is defined in [Theme Type List](#theme-type-list) and it's index within that type is explained further 
in [Indexing](#indexing).

One theme can consist of multiple versions which differ in small (mostly visual) details but all rely on the same song 
(so a theme is depended on it's song). Versions are defined by the [Version](#type.version) type.

#### Examples

- OP1: _"Kyouran Hey Kids!!"_ by _THE ORAL CIGARETTES_
    > Here _OP_ is the type (`OPENING`), the trailing _1_ is the index, _"Kyouran Hey Kids!!"_ (without quotation marks) is the
    > title and _THE ORAL CIGARETTES_ is the artist.
- ED2: _"Sacchan no Sexy Curry"_ by _Seiko Oomori_
    > Same as above, except type is now _ED_ (`ENDING`).

#### Structure

Collection Name: `theme`

##### Fields

Field | Type | Required | Notes
--- | --- | :---: | ---
_id | Number | ✓* | An unique numerical indentifier for this theme. Gets generated of the corresponding series, type and index (explained below).
series | Number | ✓* | A series identifier referencing the series this theme belongs to. See the [Series](#collection.series) collection.
type | Number | ✓* | An enum value of one of [Theme Type List](#theme-type-list).
index | Number |  ✓* | An index value representing the position of this theme in it's type-dependent list of themes. See [Indexing](#indexing).
artist | Number | - | __CURRENTLY NOT IMPLEMENTED__
title | String | ✓ | The explicit offical (maybe Japanese, but written in Latin anyway) title for this theme.
versions | Array of [Version](#type.version) | - | An array of versions for this theme. See the [Version](#type.version) type.

(*): Either `_id` or all of `series`, `type` and `index` have to be specified to allow the generation of the other.

##### Additional Notes

__`_id`:__ A 24-bit integer built out of...
- ... 16 bits for the series id (the first 16 bits counting from the left)
- ... 1 bit for the type (the 17th bit counting from the left)
- ... 8 bits for the index (the last 8 bits counting from the left)

---

## Types

### <a name="type.alias"></a>Alias

An alias for an anime entry. An alias is another name (title) for an anime which is either accepted as an official name in certain
regions or widely by the fan-base. These _can_ be equal to the ones declared in the definition (see _MyAnimeList_) but do not
have to.

Note that the explicit (or original) name of an anime entry is __not__ an alias (as it isn't by definition either). For the
explicit name see the [Anime](#table.anime) table.

#### Examples

These are valid anime alias entries:
- _Assassination Classroom_ (official western name for _Ansatsu Kyoushitsu_)
- _Oregairu_ (widely accepted shorter name for _Yahari Ore no Seishun Love Comedy wa Machigatteiru._)

These are __non__-valid anime alias entries:
- _Toradora!_ (original title)
    > This is already the explicit name of the anime and won't be included in the alias list.
- _AssClass_ (abbreviation of _Assassination Classroom_)
    > This is more of a slang than a widely accepted alias.

#### Structure

Type: String

### <a name="type.artist"></a>Artist

An artist of theme songs. These are stored seperatly to allow for filtering by an explicit artist.

Artists are defined by their name which can but not has to be in Japanese but is written in Latin letters either way. A
name can either be a band name, a artist alias or a personal name (which is used as the artist name).
Artist names are normally the same as per definition (see _MyAnimeList_).

Multiple artists are currently not supported. If a theme song has multiple artists either the group name (if one exists)
or the primary artist is choosen for the entry.

#### Examples

- _Porno Graffitti_ (band name)
- _Lia_ (artist name)
- _Nagi Yanagi_ (personal name)
- _Black Raison d'être_ (group name)
- _Rie Kugimiya [and Eri Kitamura]_ (secondary artist is omitted)

#### Structure

__CURRENTLY NOT IMPLEMENTED__

---

### <a name="type.version"></a>Version

A version of a theme. Theme versions only differ in visual appearence (most of the time).

Versions are defined by an index within a theme which is explained further in [Indexing](#indexing).

One theme version can have multiple sources which are defined by the [Source](#type.source) type.

#### Examples

These are valid theme version entries:
- _Harumodoki V1_ and _Harumodoki V2_ from _Yahari Ore no Seishun Love Comedy wa Machigatteiru. Zoku_
    > Both opening theme versions have completly different animations while still relying on the same theme song.
- _Spice V1_ and _Spice V2_ from _Shokugeki no Souma_
    > While only one shot is changed this still counts as it's own version.

These are __non__-valid theme version entries:
- The endings of _ReLIFE_
    > As every ending has it's own song every version is seperated in it's own theme entry.

#### Structure

Type: Object

##### Fields

Field | Type | Required | Notes
--- | --- | :---: | ---
index | Number | ✓ | An index value representing the position of this theme version in it's type-dependent list of theme versions. See [Indexing](#indexing).
sources | Array of [Source](#type.source) | - | An array of sources for this theme version. See the [Source](#type.source) type.

---

### <a name="type.source"></a>Source

A source of a theme version. A source is an encoded video of the theme version.

Sources are defined by an valid full qualified URL to the referenced video file. See [Hosting](#hosting).

Sources can have multiple tags which marks them with different properties. A list of these properties can be found
at [Source Tag List](#source-tag-list).

#### Examples

- `https://animethemes.moe/video/DeathParade-OP1.webm` (_no tags_)
    > No tags means the video if not considered to meet any tag's requirements
- `https://animethemes.moe/video/DeathParade-OP1-NCBD1080.webm` (NC, BD, 1080)
    > _NC_ = No Credits, _BD_ = Blu-ray Rip, _1080_ = 1080p resolution

#### Structure

Type: Object

##### Fields

Field | Type | Required | Notes
--- | --- | :---: | ---
url | String | ✓ | A valid full qualified URL to a video file for this source. See [Hosting](#hosting).
tags | Array of [Tag](#type.tag) | - | An array of tags for this source. See the [Tag](#type.tag) type.

---

### <a name="type.tag"></a>Tag

A tag of a source. A tag is used to assign certain properties to sources.

Tags are defined by an enum value. A list of all possible tag values can be found at [Source Tag List](#source-tag-list).

#### Structure

Type: Object

##### Fields

Fields | Type | Required | Notes
--- | --- | :---: | ---
id | Number | ✓ | An enum value of one of [Source Tag List](#source-tag-list).

## Theme Type List

Numerical Value | Text Value | Description
--- | --- | ---
0 | `OP` | The opening of an anime episode or movie.
1 | `ED` | The ending of an anime episode or movie (credit-roll).

## Source Tag List

Numerical Value | Text Value | Description
--- | --- | ---
0 | `NC` | No credits. The video is _clean_ and all overlay text was removed.
1 | `720` | The video has 720p resolution.
2 | `1080` | The video has 1080p resolution.
3 | `Subbed` | The video includes subtitles of the dialogue.
4 | `Lyrics` | The video includes English lyrics subtitles.