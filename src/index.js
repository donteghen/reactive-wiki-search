const { combineLatest, bufferCount, bufferTime, interval, skip, take, map, tap, timeInterval, fromEvent, mergeMap, 
    filter, catchError, debounceTime, from} = rxjs;
const {ajax} = rxjs.ajax
// const {combineLatest, bufferCount, bufferTime, interval, skip, take, map, tap, timeInterval, fromEvent, mergeMap, filter, debounceTime} = require('rxjs')
// const {ajax} = require('rxjs/ajax');

const searchBox = document.querySelector('#search'); 
const results = document.querySelector('#results');  
const count = document.querySelector('#count');
const submit = document.querySelector('#submit');

const _URL = 'https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json';

const notEmpty = input => !!input && input.trim().length > 0;

function clearResults(container) {
    while(container.childElementCount > 0) {
       container.removeChild(container.firstChild);
    }
}

function appendResults(result, container) {
    let li = document.createElement('li');
    let text = document.createTextNode(result);
    li.appendChild(text);
    container.appendChild(li);
}

const inputEvents$ = fromEvent(searchBox, 'keyup').pipe(
    map(R.compose(R.prop('value'), R.prop('target'))),
    debounceTime(500),
    filter(notEmpty),
    tap(term => console.log(`Searching with term ${term}`)),
    // map(term => {
    //     console.log('term', term, _URL + term)
    //     return _URL.replace('query', term)
    // }),
    mergeMap(query => from(searchWikipedia(query)).pipe(            
            map(R.compose(R.prop('search'), R.prop('query'))),
            catchError(error => {
                console.log('error: ', error);
                return of(error);
            }),
            tap(r => console.log(r)),
        )
    ),
    map(R.map(R.prop('title')))
).subscribe(
    console.log
)


function searchWikipedia (searchTerm) {
    
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch=${encodeURIComponent(searchTerm)}&origin=*`;
    return new Promise ((resolve, reject) => {
        fetch(url)
        .then(response => {
            if (!response.ok) {
                reject('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => resolve(data))
        .catch(error => reject('There was a problem with the fetch operation:', error));
    })
    
};
