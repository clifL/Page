// Comment - This line is not executed.
// This is my first JavaScript code
fetch('https://api.data.gov.sg/v1/transport/carpark-availability' , {method: 'GET'})
    .then(res => {
        if (res.ok) {
            console.log("Success")
            return res.json()
        }
        else {
            console.log("Not successful")
        }
    })
    .then(data => console.log(data))
    .catch(error => console.log("Error"))