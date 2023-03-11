function onFileInputChange() {
    let nameValue = document.getElementById("uploadimage").value;
    console.log('onFileInputChange' + nameValue);
    let imageIdInput = document.getElementById("imageid");
    imageIdInput.value = getUniqueName();
}

function getUniqueName() {
    let num = Math.random() * 100000;
    let numStr = Math.round(num).toString() + Date.now();
    console.log('imageid1 = ' + numStr);
    return numStr;
}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

function hideAllPages() {
    let pages = document.getElementsByClassName("page");
    let size = pages.length;

    for (var i = 0; i < size; i++) {
        let pagediv = pages[i];
        pagediv.style.visibility="hidden";
    }
};

const resolved = 'Resolved image';
const nonResolved = 'Not resolved';

async function loadImage(refreshIntervalId){
    const imageid = localStorage.getItem("imageid");
	console.log('Image id is' + imageid);
	const urlGetImage = "http://127.0.0.1:3123/api/images/" + imageid;
	console.log('url : ' + urlGetImage);
    const response = fetch(urlGetImage, 
        {
            nethod: "GET",
           // headers: {"Content-Type": "application/json"}
        })
    .then((response) => { 
        console.log(response);
        return response.json(); 
    })
    .then((data) => {
        console.log(data.imageUrl);
        let imageUrl = response.json.imageUrl;
/*         if(response.json.processed === true) {
            document.getElementById(resizedimage).src = imageUrl;
            isResolved =  true;
            console.log("image resolved");
            clearInterval(refreshIntervalId);
        } else {
            isResolved = false;
            console.log("image still not resolved");
        }  */
        document.getElementById("resultlabel").innerHTML = resolved;
        console.log("called end interval");
        //clearInterval(refreshIntervalId);
    }).catch(err=>console.log(err));

    if(document.getElementById("resultlabel").innerHTML === nonResolved) {
        console.log("Sent status update fetch");
        const imageid = localStorage.getItem("imageid");       
        const urlGetStatus = "http://127.0.01:3123/api/status/" + imageid;
        console.log("Status request sent to: " + urlGetStatus )
        fetch(urlGetStatus, 
            {
                nethod: "GET",
               // headers: {"Content-Type": "application/json"}
            })
            .then((response) => { 
                console.log(response);
                return response.json(); 
            })
            .then((data) => {
                console.log(data.status);
                document.getElementById("resultlabel").innerHTML = data.status;

            }).catch(err=>console.log(err));
    }


/*     let imageUrl = response.json.imageUrl;
    if(response.json.processed === true) {
        document.getElementById(resizedimage).src = imageUrl;
        isResolved =  true;
        console.log("image resolved");
        clearInterval(refreshIntervalId);
    } else {
        isResolved = false;
        console.log("image still not resolved");
    } 
    //let resImage = document.getElementById('resizedimage');
    //console.log(resImage);
    //resImage.src = 'https://im-homework.s3.amazonaws.com/1678397069238_dfh5w7y-54c2d9d9-2b4f-4d3c-8539-722612b3f03b.jpg';
    console.log("called");
    clearInterval(refreshIntervalId); */
}

async function waitForImage(){
    console.log('wait results');
    //let refreshIntervalId = setInterval(function(){loadImage(refreshIntervalId)}, 1000);
    loadImage('dummyInterval');
    
}

async function onResultPageLoaded() {
    console.log('wait results1');
    let imageid = localStorage.getItem("imageid");
    console.log('wait results2' + imageid);
    if(!isNumeric(imageid)) {
        console.log('wait results5' + imageid);
        return;
    }
    console.log('wait results3');
    //loadImage(imageid);
    waitForImage();
}

function onChangePage(page) {
    console.log('onChangePage');
    let pageVisible = page;
    if(page === 'page2') {
        onResultPageLoaded();
    }
}


window.addEventListener("load", (event) => {
    console.log("page is fully loaded");
    let imageid = 0;


    const btn = document.getElementById("submitbutton");    
    btn.addEventListener('click', ()=> {
            console.log('WOrks!');
            let resolution = document.getElementById("resolution").value;
            console.log(resolution);
            let imageid = document.getElementById("imageid").value;
            console.log('Final imageid: ' + imageid);
            let imageinput = document.getElementById("uploadimage");
            console.log(imageinput);
            console.log(imageinput.files);
            console.log(imageinput.files.length);
                
            // Store
            localStorage.setItem("imageid", imageid);
            // Retrieve
            document.getElementById("showimageid").innerHTML = "Image id is: " + localStorage.getItem("imageid");
    });

    const home = document.getElementById("home");    
    home.addEventListener('click', ()=> {
            hideAllPages();
            let homesection = document.getElementById("page1");
            homesection.style.visibility = "visible";
            onChangePage("page1");
    });            
    const results = document.getElementById("results");    
    results.addEventListener('click', ()=> {
            console.log('clicked results');
            hideAllPages();
            let resultsection = document.getElementById("page2");
            resultsection.style.visibility = "visible";
            onChangePage("page2");
            
    });   
     const about = document.getElementById("about");    
     about.addEventListener('click', ()=> {
            hideAllPages();
             let aboutsection = document.getElementById("page3");
             aboutsection.style.visibility = "visible";
             onChangePage("page3");
    });                
        


    const resultdiv = document.getElementById("resultdiv");
    resultdiv.addEventListener('click', ()=> {
        hideAllPages();
         let aboutsection = document.getElementById("page3");
         aboutsection.style.visibility = "visible";
});       

  });
