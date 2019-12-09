(function () {

    // Helpers
    var shuffle = function (array) {

        var currentIndex = array.length;
        var temporaryValue, randomIndex;
    
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
    
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
    
        return array;
    
    };

    // App
    var app = new Vue({
        el: '#app',
        data: {
            queries: [],
            queryIndex: -1,
            queryText: "",
            results: [],
            isTyping: false
        },
        mounted: function () {

            var self = this;

            // Load all the queries
            fetch("/data/queries.js").then(function(resp) {
                if (resp.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + resp.status);
                    return;
                }

                resp.json().then(function(data) {
                    self.queries = shuffle(data);

                    self.next();
                });

            })
            .catch(function(err) {
                console.log('Fetch Error :-S', err);
            });

        },
        computed: {
            query: function (){ 
                return this.queries[this.queryIndex];
            }
        },
        methods: {
            next: function () {

                var self = this;

                // If we are typing, just exit
                if (self.isTyping)
                    return;

                // Reset
                self.reset();

                // Increment query index
                self.queryIndex += 1;
                if (self.queryIndex > self.queries.length - 1) 
                    self.queryIndex = 0;

                // Start typing query
                self.typeQuery();

            },
            typeQuery: function () {

                var self = this;

                // Set typing flag
                self.isTyping = true;

                // Type the text out one character at a time
                var targetText = self.query + '…';
                var typedLen = self.queryText.length;
                self.queryText = targetText.substr(0, ++typedLen);
                if (self.queryText != targetText) {
                    setTimeout(function(){ 
                        self.typeQuery();
                    }, 101);
                } else {
                    self.isTyping = false;
                    self.fetchResults();
                }

            },
            fetchResults: function () {

                var self = this;

                // Populate results
                var url = "https://suggestqueries.google.com/complete/search?hl=en&client=youtube&q=" + self.query;
                fetchJsonp(url).then(function(resp) {
                    resp.json().then(function(data) {
                        self.results = data[1].slice(0, 6);
                    });
                });

            },
            reset: function () {

                var self = this;

                self.queryText = "";
                self.results = [];

            }
        }
    });



})();