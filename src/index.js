const { combineLatest, bufferCount, bufferTime, interval, skip, take, map, tap, timeInterval, fromEvent, mergeMap, 
    filter, catchError, debounceTime, from, of} = rxjs;



const searchBox = document.querySelector('#search'); 
const results = document.querySelector('#results');  
const count = document.querySelector('#count');
const submit = document.querySelector('#submit');

const _URL = 'https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json';

const notEmpty = input => !!input && input.trim().length > 0;

const clearResults = (container) => {
    while(container.childElementCount > 0) {
       container.removeChild(container.firstChild);
    }
}

const appendResults = (results, container) => {
    results.forEach(result => {
        let li = document.createElement('li');
        let text = document.createTextNode(result);
        li.appendChild(text);
        container.appendChild(li);
    })
}

const updateCount = (results, ele) => {
    ele.removeAttribute('hidden');
    ele.textContent = `${results.length} ${results.length > 1 ? 'Results' : 'Result'} ${results.length > 0 ? '🎉' : ''}`;  
}

const inputEvents$ = fromEvent(searchBox, 'keyup').pipe(
    map(R.compose(R.prop('value'), R.prop('target'))),
    debounceTime(500),
    filter(notEmpty),
    //tap(term => console.log(`Searching with term ${term}`)),
    mergeMap(query => from(searchWikipedia(query)).pipe(            
            map(R.compose(R.prop('search'), R.prop('query'))),
            catchError(error => {
                return of(error);
            }),
            //tap(r => console.log(r)),
        )
    ),
    map(R.map(R.prop('title')))
).subscribe({
    next: (titles) => {
        updateCount(titles, count);      
        clearResults(results);
        appendResults(titles, results);
    }
});



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
