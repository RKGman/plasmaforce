class Scores {
  constructor() {
    this.topTen = null;
  }

  httpGetAsync(theUrl, timeout, difficultyString, callback) {
    var xmlHttp = new XMLHttpRequest();
    var params = "difficulty=" + difficultyString;
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        this.topTen = JSON.parse(JSON.parse(this.responseText))
        callback(this.topTen);
      } else if (xmlHttp.status == 500) {
        callback(null);
      }       
    }

    xmlHttp.ontimeout = function () {
      callback(null);
    };

    xmlHttp.onerror = function () {
      callback(null);
    };

    xmlHttp.timeout = timeout;
    xmlHttp.open("GET", theUrl + "?" + params, true); // asynchronous 

    xmlHttp.send(null);
  }

  httpPostAsync(theUrl, timeout, initialsString, scoreInt, difficultyString, callback) {
    var http = new XMLHttpRequest();
    var params = 'initials=' + initialsString + "&score=" + scoreInt + "&difficulty=" + difficultyString;   

    http.onreadystatechange = function () { //Call a function when the state changes.
      if (http.readyState == 4 && http.status == 200) {
        //console.log(http.responseText);
        this.topTen = JSON.parse(JSON.parse(this.responseText))
        callback(this.topTen);
      }
    }

    http.timeout = timeout;
    http.open('POST', theUrl, true);

    //Send the proper header information along with the request
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    http.ontimeout = function () {
      console.log("Post timeout event :(");
      callback(null);
    };
    http.onerror = function () {
      console.log("Http error event :(");
      callback(null);
    };

    http.send(params);
  }

  getCallback(response) {
    console.log(response);
  }

  getTopTen() {
    return this.topTen;
  }
}

export default Scores