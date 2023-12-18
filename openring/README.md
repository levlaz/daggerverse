# Openring 

Generate webring from RSS feeds using [openring](https://git.sr.ht/~sircmpwn/openring/tree/master/item/README.md). Useful for use with a static site generator.

## Input File Requirements
`sources.txt` should be a file with a list of rss feeds, one per line. 

(i.e.) 

sources.txt
```
https://levlaz.org/index.xml
https://dagger.io/rss/feed.xml
https://rknight.me/feed.xml
```

## Usage Example 
```bash
dagger export --output=out.html \
    -m openring openring \
    --sources=sources.txt 
```

