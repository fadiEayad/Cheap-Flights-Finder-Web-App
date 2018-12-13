import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import plane from './airplane.png';

class App extends Component {
  constructor(){
    super();

    this.state = {
      origin: '',
      destination: '',
      firstDate: '',
      secondDate: '',
      data: '',
      sent: false
    }

    this.setCities = this.setCities.bind(this);
    this.setDates = this.setDates.bind(this);
    this.getData = this.getData.bind(this);
  }

  //https://api.skypicker.com/flights?fly_from=houston&fly_to=austin&date_from=05/11/2018&date_to=09/11/2018

  getData(){

    this.setState({
      sent: true
    })

    let {origin, destination} = this.state;

    origin = origin.trim();
    destination = destination.trim();

    let originArr = origin.split(" ");
    let destinationArr = destination.split(" ");

    let originName = "";
    let destinationName = "";

    var i = 0;
    var j = 0;

    for(i = 0; i < destinationArr.length; i++){
      destinationName += destinationArr[i];
      if(i != (destinationArr.length - 1)){
        destinationName += "-";
      }
    }

    for(j = 0; j < originArr.length; j++){
      originName += originArr[j];
      if(j != (originArr.length - 1)){
        originName += "-";
      }
    }

    let url = 'https://api.skypicker.com/flights?';
    origin = 'fly_from=' + originName.toLowerCase() + "&";
    destination = 'fly_to=' + destinationName.toLowerCase() + '&';
    let firstDate = 'date_from=' + this.state.firstDate + '&';
    let secondDate = 'date_to=' + this.state.secondDate;
    url = url + origin + destination + firstDate + secondDate + "&curr=USD";

    axios.get(url).then(response => {

      let data = response.data.data
      
      //Use the minutes to sort the data
      data.sort(function(a, b){
        return a.price - b.price
      })

      data = data.slice(0,19);

      this.setState({
        data
      })
      
    }).catch(err => {
      console.log(err);
    })

  }

  setCities(e){

    let {name, value} = e.target;

    let {origin, destination} = this.state;

    if(name === 'origin'){
      origin = value
    }else{
      destination = value
    }

    this.setState({
      origin,
      destination
    })

  }

  setDates(e){

    let {name, value} = e.target;

    let arr = value.split("-");
    value = arr[2] + "/" + arr[1] + "/" + arr[0];
    
    let {firstDate, secondDate} = this.state;

    if(name === 'firstDate'){
      firstDate = value;
    }else{
      secondDate = value;
    }

    this.setState({
      firstDate,
      secondDate
    })

  }

  render() {

    let loadingScreen = (
      <div className='center'>
        <img src={plane} alt='loading screen' id='loading-icon'/>
        <h4 className='text-center text-secondary'>Hold on, we are getting the data</h4>
      </div>
    )

    let JSX;

    if(!this.state.data && this.state.sent){
      JSX = loadingScreen;
    }else if(!this.state.sent){
      JSX = <InputRound setDates={this.setDates} getData={this.getData} setCities={this.setCities}/>
    }else if(this.state.data){
      JSX = <DisplayFlights origin={this.state.origin} destination={this.state.destination} data={this.state.data}/>
    }

    return (
      <div className='m-5'>
        {JSX}
      </div>
    );
  }
}

export default App;

//Add extra stop, modify url 
function InputRound(props){

  return(
    <div className='m-5'>
        <h1 className='text-center text-success m-3'>Economical Route</h1>
        <input type='text' placeholder='Origin' className='input-city' name='origin'  onChange={props.setCities}/>
        <input type='text' placeholder='Destination' className='input-city' name='destination' onChange={props.setCities}/>
        <div className='row'>
          <div className='col-6 text-center'>
            <h5 className='text my-3'>Departure Date</h5>
            <input type='date' name='firstDate' onChange={props.setDates} className='m-1'/>
          </div>
          <div className='col-6 text-center'>
            <h5 className='text my-3'>Arrival Date</h5>
            <input type='date' name='secondDate' onChange={props.setDates} className='m-1'/>
          </div>
        </div>
        <div className='btn btn-primary send-btn my-3' onClick={props.getData}>Send</div>
    </div>
  )

}

function DisplayFlights(props){

  let avgPrice = 0;

  props.data.forEach(el => {

    avgPrice = avgPrice + el.price

  });

  avgPrice = avgPrice / props.data.length;

  let flights = props.data.map(flight => {

    let arrival = new Date(flight.aTime*1000);
    let departure = new Date(flight.dTime*1000);

    let arrivalArr = arrival.toString().split(" ");
    let departureArr = departure.toString(). split(" ");

    arrival = arrivalArr[4];
    departure = departureArr[4];

    let date = departure + " - " + arrival;

    let arrivalDay = arrivalArr[2];
    let departureDay = departureArr[2];

    let string = flight.route[0].flyFrom;

    flight.route.forEach(el => {
      string = string + "-" + el.flyTo;
    })
    
    let extraDay = '';

    if(arrivalDay !== departureDay){
      extraDay = ' +1';
    }

    let colorStyle;

    if(flight.price > avgPrice){
      colorStyle = {
        color: 'red'
      }
    }else{
      colorStyle = {
        color: 'green'
      }
    }

    return(
      <div className='flight-info row'>
        <div className='col-4'>
          <h5 className='mx-3'>{date + extraDay}</h5>
          <p className='mx-3'>{flight.route[0].airline}</p>
        </div>
        <div className='col-4'>
          <p className='mx-3'>{flight.fly_duration}</p>
          <p className='mx-3'>{string}</p>
        </div>
        <p className='col-4' style={colorStyle}>{"$" + flight.price}</p>
      </div>
    )
  })
  
  return(
    <div>
      <h3 className='text-center text-primary'>Flights from {props.origin} to {props.destination}</h3>
      <div className='m-0'>
        {flights}
      </div>
    </div>
  )

}
